
import { Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  HeartPulse,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  FileText,
  ChevronRight,
  UserRound,
} from "lucide-react";
import api from "../../services/api";
import "./PainAssessment.css";
const PAIN_STORAGE_KEY = "hospital_pain_assessment";

function getSavedPainAssessment() {
  try {
    const saved = localStorage.getItem(PAIN_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}
const symptomOptions = [
  "Hərarət",
  "Ürəkbulanma",
  "Qusma",
  "Başgicəllənmə",
  "Nəfəs darlığı",
  "Sinədə sıxılma",
  "Huşun itməsi",
  "Qəfil zəiflik və ya keyimə",
  "Şişkinlik",
  "Uyuşma",
];

const bodyRegions = [
  "Baş",
  "Boyun",
  "Sinə",
  "Qarın",
  "Bel",
  "Çanaq",
  "Sol qol",
  "Sağ qol",
  "Sol ayaq",
  "Sağ ayaq",
];

const urgentSymptoms = [
  "Nəfəs darlığı",
  "Sinədə sıxılma",
  "Huşun itməsi",
  "Qəfil zəiflik və ya keyimə",
];

function formatInline(text) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }

    return part;
  });
}

function AnalysisContent({ text }) {
  const normalized = text
    .replace(/\\([*#_])/g, "$1")
    .replace(/\r\n/g, "\n");

  const lines = normalized.split("\n");
  const elements = [];
  let paragraph = [];
  let list = [];
  let listType = "";
  let key = 0;

  const flushParagraph = () => {
    if (!paragraph.length) return;

    elements.push(
      <p className="pain-analysis-paragraph" key={key++}>
        {formatInline(paragraph.join(" "))}
      </p>
    );

    paragraph = [];
  };

  const flushList = () => {
    if (!list.length) return;

    const Tag = listType === "number" ? "ol" : "ul";

    elements.push(
      <Tag className="pain-analysis-list" key={key++}>
        {list.map((item, index) => (
          <li key={index}>{formatInline(item)}</li>
        ))}
      </Tag>
    );

    list = [];
    listType = "";
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    const heading = line.match(/^#{1,3}\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();

      elements.push(
        <h3 className="pain-analysis-heading" key={key++}>
          <span className="pain-analysis-heading-mark">
            <CheckCircle2 size={17} />
          </span>
          {formatInline(heading[1])}
        </h3>
      );

      return;
    }

    const numbered = line.match(/^\d+[.)]\s+(.+)$/);
    const bullet = line.match(/^[-*•]\s+(.+)$/);

    if (numbered || bullet) {
      flushParagraph();

      const nextType = numbered ? "number" : "bullet";

      if (list.length && listType !== nextType) {
        flushList();
      }

      listType = nextType;
      list.push((numbered || bullet)[1]);
      return;
    }

    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();

  return <div className="pain-analysis-content">{elements}</div>;
}

function SelectedPoint({ position }) {
  if (!position) return null;

  return (
    <group position={position}>
      <mesh renderOrder={10}>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshBasicMaterial
          color="#ff2020"
          depthTest={false}
          depthWrite={false}
          transparent
          opacity={1}
        />
      </mesh>

      <mesh renderOrder={9}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshBasicMaterial
          color="#ff0000"
          depthTest={false}
          depthWrite={false}
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

function HumanModel({ onSelect }) {
  const { scene } = useGLTF("/models/human-body.glb");

  const { model, center, scale, bounds } = useMemo(() => {
    const cloned = scene.clone(true);
    const originalBox = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    originalBox.getSize(size);
    originalBox.getCenter(center);

    const scale = size.y > 0 ? 3.2 / size.y : 1;

    cloned.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      const materials = Array.isArray(child.material)
        ? child.material
        : [child.material];

      const newMaterials = materials.map((original) => {
        if (!original) return original;

        const material = original.clone();

        if (material.color) {
          if (
            material.color.r > 0.82 &&
            material.color.g > 0.82 &&
            material.color.b > 0.82
          ) {
            material.color.set("#7897b0");
          } else {
            material.color.multiplyScalar(0.82);
          }
        }

        if (material.roughness !== undefined) {
          material.roughness = 0.8;
        }

        if (material.metalness !== undefined) {
          material.metalness = 0;
        }

        if (material.emissive) {
          material.emissive.set("#172c40");
          material.emissiveIntensity = 0.12;
        }

        material.needsUpdate = true;
        return material;
      });

      child.material = Array.isArray(child.material)
        ? newMaterials
        : newMaterials[0];
    });

    return {
      model: cloned,
      center,
      scale,
      bounds: originalBox,
    };
  }, [scene]);

  const handleClick = (event) => {
    event.stopPropagation();

    model.updateMatrixWorld(true);

    const localPoint = model.worldToLocal(event.point.clone());
    const size = new THREE.Vector3();

    bounds.getSize(size);

    if (size.y <= 0 || size.x <= 0) return;

    const normalizedY =
      (localPoint.y - bounds.min.y) / size.y;

    const normalizedX =
      (localPoint.x - bounds.min.x) / size.x;

    let selectedRegion;

    if (normalizedY >= 0.86) {
      selectedRegion = "Baş";
    } else if (normalizedY >= 0.76) {
      selectedRegion = "Boyun";
    } else if (normalizedY >= 0.53) {
      if (
        normalizedY < 0.68 &&
        (normalizedX < 0.28 || normalizedX > 0.72)
      ) {
        selectedRegion =
          normalizedX < 0.5 ? "Sol qol" : "Sağ qol";
      } else {
        selectedRegion = "Sinə";
      }
    } else if (normalizedY >= 0.39) {
      selectedRegion = "Qarın";
    } else if (normalizedY >= 0.29) {
      selectedRegion = "Çanaq";
    } else {
      selectedRegion =
        normalizedX < 0.5 ? "Sol ayaq" : "Sağ ayaq";
    }

    /*
     * Kliklənən nöqtəni dünya koordinatlarında götürürük.
     * Səth normalı markerin bədənin içinə düşməməsinə kömək edir.
     */
    const point = event.point.clone();

    if (event.face && event.object) {
      const normal = event.face.normal
        .clone()
        .transformDirection(event.object.matrixWorld);

      point.add(normal.multiplyScalar(0.025));
    }

    onSelect(selectedRegion, point);
  };

  return (
    <group
      position={[
        -center.x * scale,
        -center.y * scale,
        -center.z * scale,
      ]}
      scale={scale}
    >
      <primitive
        object={model}
        onPointerDown={handleClick}
      />
    </group>
  );
}

function ModelFallback() {
  return (
    <mesh>
      <capsuleGeometry args={[0.4, 1.5, 8, 16]} />
      <meshStandardMaterial
        color="#688ba5"
        roughness={0.8}
      />
    </mesh>
  );
}

export default function PainAssessment() {
  const [region, setRegion] = useState("");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState("Bu gün başlayıb");
  const [painType, setPainType] = useState("Sızıltı");
  const [symptoms, setSymptoms] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [emergencyMessage, setEmergencyMessage] = useState("");

  const urgent = symptoms.some((item) =>
    urgentSymptoms.includes(item)
  );

  const selectRegionFromList = (item) => {
    setRegion(item);
    setSelectedPoint(null);
    setError("");
  };

  const handleModelSelect = (selectedRegion, point) => {
    setRegion(selectedRegion);
    setSelectedPoint(point);
    setError("");
  };

  const toggleSymptom = (symptom) => {
    setSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom]
    );
  };

  const analyzePain = async (event) => {
    event.preventDefault();

    setError("");
    setResult("");
    setEmergencyMessage("");

    if (!region) {
      setError("Əvvəlcə ağrıyan bədən nahiyəsini seç.");
      return;
    }

    if (urgent) {
      setEmergencyMessage(
        "Seçdiyin simptomlar təcili tibbi qiymətləndirmə tələb edə bilər. AI nəticəsini gözləmə; dərhal tibbi yardım al."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/PainAssessment/analyze",
        {
          bodyPart: region,
          painLevel: Number(severity),
          symptoms: symptoms.join(", "),
          description: [
            `Ağrının növü: ${painType}`,
            notes.trim(),
          ]
            .filter(Boolean)
            .join(". "),
          duration,
        }
      );

      setResult(
        response.data?.analysis ||
          "AI analiz nəticəsi qaytarılmadı."
      );

      if (response.data?.emergencyMessage) {
        setEmergencyMessage(
          response.data.emergencyMessage
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Analiz zamanı xəta baş verdi. Bir qədər sonra yenidən cəhd et."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRegion("");
    setSelectedPoint(null);
    setSeverity(5);
    setDuration("Bu gün başlayıb");
    setPainType("Sızıltı");
    setSymptoms([]);
    setNotes("");
    setResult("");
    setError("");
    setEmergencyMessage("");
  };

  return (
    <main className="pain-page">
      <header className="pain-hero">
        <div className="pain-hero-copy">
          <div className="pain-eyebrow">
            <span className="pain-eyebrow-icon">
              <Sparkles size={15} />
            </span>
            AVROPA HOSPITAL · AI HEALTH
          </div>

          <h1>
            Sağlamlığını
            <br />
            <span>anlamağa başla.</span>
          </h1>

          <p className="pain-hero-description">
            Simptomlarını qeyd et, ağrıyan nahiyəni seç və
            süni intellekt dəstəyi ilə məlumatlandırıcı analiz əldə et.
          </p>

          <div className="pain-hero-features">
            <span>
              <ShieldCheck size={16} />
              Məxfilik nəzərə alınır
            </span>
            <span>
              <BrainCircuit size={16} />
              AI dəstəkli analiz
            </span>
          </div>
        </div>

        <div className="pain-hero-visual" aria-hidden="true">
          <div className="pain-orbit pain-orbit-one" />
          <div className="pain-orbit pain-orbit-two" />

          <div className="pain-hero-core">
            <HeartPulse size={70} strokeWidth={1.25} />
          </div>

          <div className="pain-floating-card pain-floating-top">
            <span className="pain-floating-icon">
              <Activity size={17} />
            </span>
            <span>
              <strong>Health insights</strong>
              <small>Simptomların qiymətləndirilməsi</small>
            </span>
          </div>

          <div className="pain-floating-card pain-floating-bottom">
            <CheckCircle2 size={20} />
            <span>Fərdi məlumatlandırma</span>
          </div>
        </div>
      </header>

      <div className="pain-disclaimer">
        <div className="pain-disclaimer-icon">
          <ShieldCheck size={20} />
        </div>
        <div>
          <strong>Tibbi məlumatlandırma vasitəsi</strong>
          <p>
            Bu analiz diaqnoz və ya müalicə deyil, həkim
            müayinəsini əvəz etmir. Şiddətli və qəfil simptomlarda
            təcili tibbi yardım al.
          </p>
        </div>
      </div>

      <form className="pain-layout" onSubmit={analyzePain}>
        <section className="pain-card pain-model-card">
          <div className="pain-card-heading">
            <div>
              <span className="pain-step">
                01 / BƏDƏN XƏRİTƏSİ
              </span>
              <h2>Ağrıyan nahiyə</h2>
              <p>
                Modeldə ağrıyan yerə kliklə və ya aşağıdan seç.
              </p>
            </div>

            <span className="pain-model-tag">
              <Activity size={14} />
              3D MODEL
            </span>
          </div>

          <div className="pain-model-legend">
            <span className="pain-legend-dot" />
            Toxunduğun nöqtə burada işarələnəcək
          </div>

          <div className="pain-canvas">
            <Canvas
              camera={{ position: [0, 0.15, 4.5], fov: 38 }}
              gl={{
                antialias: true,
                alpha: false,
              }}
              shadows
            >
              <color attach="background" args={["#aebfce"]} />
              <fog attach="fog" args={["#aebfce", 8, 14]} />

              <ambientLight intensity={0.85} />

              <directionalLight
                position={[3, 4, 5]}
                intensity={1.5}
                color="#ffffff"
                castShadow
              />

              <directionalLight
                position={[-3, 2, -4]}
                intensity={0.75}
                color="#80b9d9"
              />

              <directionalLight
                position={[0, 1, 3]}
                intensity={0.6}
                color="#c2e4f4"
              />

              <Environment preset="studio" />

              <Suspense fallback={<ModelFallback />}>
                <HumanModel onSelect={handleModelSelect} />
              </Suspense>

              <SelectedPoint position={selectedPoint} />

              <OrbitControls
                enablePan={false}
                minDistance={2.5}
                maxDistance={6}
                minPolarAngle={0.65}
                maxPolarAngle={2.45}
                enableDamping
                dampingFactor={0.08}
              />
            </Canvas>

            <div className="pain-model-hint">
              <ArrowLeftRight size={15} />
              Modeli fırlatmaq üçün sürüşdür
            </div>

            <div className="pain-front-label">
              <UserRound size={14} />
              Ön görünüş
            </div>
          </div>

          <div className="pain-selected">
            <div className="pain-selected-icon">
              <Activity size={19} />
            </div>

            <div>
              <span>SEÇİLMİŞ BƏDƏN NAHİYƏSİ</span>
              <strong>{region || "Nahiyə seçilməyib"}</strong>
            </div>

            {region && (
              <CheckCircle2
                className="pain-selected-check"
                size={21}
              />
            )}
          </div>

          <div className="pain-region-list">
            {bodyRegions.map((item) => (
              <button
                type="button"
                key={item}
                className={region === item ? "selected" : ""}
                onClick={() => selectRegionFromList(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="pain-reset"
            onClick={resetForm}
          >
            <RotateCcw size={15} />
            Formanı sıfırla
          </button>
        </section>

        <section className="pain-card pain-form-card">
          <div className="pain-card-heading">
            <div>
              <span className="pain-step">
                02 / MƏLUMATLAR
              </span>
              <h2>Özünü necə hiss edirsən?</h2>
              <p>
                Analiz üçün aşağıdakı məlumatları daxil et.
              </p>
            </div>

            <div className="pain-heading-badge">
              <BrainCircuit size={22} />
            </div>
          </div>

          <div className="pain-field">
            <div className="pain-label-row">
              <label htmlFor="pain-severity">
                Ağrının intensivliyi
              </label>

              <strong
                className={`pain-score ${
                  severity >= 8 ? "high" : ""
                }`}
              >
                {severity}
                <small> / 10</small>
              </strong>
            </div>

            <input
              id="pain-severity"
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) =>
                setSeverity(Number(e.target.value))
              }
              className="pain-slider"
              style={{
                "--pain-range": `${((severity - 1) / 9) * 100}%`,
              }}
            />

            <div className="pain-range-labels">
              <span>Yüngül</span>
              <span>Orta</span>
              <span>Şiddətli</span>
            </div>
          </div>

          <div className="pain-fields-grid">
            <div className="pain-field">
              <label htmlFor="pain-duration">
                <Clock3 size={15} />
                Nə vaxtdan ağrıyır?
              </label>

              <select
                id="pain-duration"
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
              >
                <option>Yeni başlayıb</option>
                <option>Bu gün başlayıb</option>
                <option>1–3 gündür</option>
                <option>4–7 gündür</option>
                <option>Bir həftədən çoxdur</option>
                <option>Təkrarlanan ağrıdır</option>
              </select>
            </div>

            <div className="pain-field">
              <label htmlFor="pain-type">
                <Activity size={15} />
                Ağrının növü
              </label>

              <select
                id="pain-type"
                value={painType}
                onChange={(e) =>
                  setPainType(e.target.value)
                }
              >
                <option>Sızıltı</option>
                <option>İti və kəskin</option>
                <option>Sancma</option>
                <option>Yanma</option>
                <option>Döyünmə</option>
                <option>Təzyiq hissi</option>
                <option>Keyimə və ya uyuşma</option>
              </select>
            </div>
          </div>

          <div className="pain-field">
            <div className="pain-label-row">
              <label>
                <HeartPulse size={16} />
                Əlavə simptomlar
              </label>

              <span className="pain-optional">
                {symptoms.length} seçilib
              </span>
            </div>

            <div className="pain-symptoms">
              {symptomOptions.map((item) => (
                <label
                  key={item}
                  className={
                    symptoms.includes(item)
                      ? "pain-symptom checked"
                      : "pain-symptom"
                  }
                >
                  <input
                    type="checkbox"
                    checked={symptoms.includes(item)}
                    onChange={() => toggleSymptom(item)}
                  />

                  <span className="pain-symptom-check">
                    <CheckCircle2 size={14} />
                  </span>

                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pain-field">
            <div className="pain-label-row">
              <label htmlFor="pain-notes">
                <FileText size={16} />
                Əlavə məlumat
              </label>

              <span className="pain-optional">
                İstəyə bağlı
              </span>
            </div>

            <textarea
              id="pain-notes"
              rows="4"
              maxLength="1000"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ağrının nə vaxt başladığını, nəyin artırdığını və digər müşahidələrini qeyd et..."
            />

            <div className="pain-character-count">
              {notes.length}/1000
            </div>
          </div>

          {error && (
            <div className="pain-error" role="alert">
              <AlertTriangle size={19} />
              <span>{error}</span>
            </div>
          )}

          {emergencyMessage && (
            <div className="pain-error" role="alert">
              <AlertTriangle size={19} />
              <span>{emergencyMessage}</span>
            </div>
          )}

          {urgent && !emergencyMessage && (
            <div className="pain-urgent-hint" role="status">
              <AlertTriangle size={17} />
              Seçilmiş simptomlardan bəziləri təcili tibbi
              qiymətləndirmə tələb edə bilər.
            </div>
          )}

          <button
            type="submit"
            className="pain-analyze-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle
                  className="pain-spin"
                  size={20}
                />
                Analiz hazırlanır...
              </>
            ) : (
              <>
                <BrainCircuit size={20} />
                AI analizi başlat
                <ChevronRight
                  size={19}
                  className="pain-button-arrow"
                />
              </>
            )}
          </button>

          <div className="pain-form-footnote">
            <ShieldCheck size={15} />
            Nəticə məlumatlandırıcı xarakter daşıyır.
          </div>
        </section>
      </form>

      {result && (
        <section className="pain-result-section">
          <div className="pain-result-top">
            <div className="pain-result-title-icon">
              <Sparkles size={23} />
            </div>

            <div>
              <span className="pain-step">
                AI HEALTH REPORT
              </span>
              <h2>Analiz nəticəsi</h2>
              <p>
                Daxil etdiyin məlumatlar əsasında hazırlanmış hesabat
              </p>
            </div>

            <span className="pain-report-status">
              <CheckCircle2 size={15} />
              Hazırdır
            </span>
          </div>

          <div className="pain-report-summary">
            <div>
              <span>Bədən nahiyəsi</span>
              <strong>{region}</strong>
            </div>

            <div>
              <span>Ağrı intensivliyi</span>
              <strong>{severity}/10</strong>
            </div>

            <div>
              <span>Müddət</span>
              <strong>{duration}</strong>
            </div>
          </div>

          {emergencyMessage && (
            <div
              className="pain-error pain-report-warning"
              role="alert"
            >
              <AlertTriangle size={19} />
              <span>{emergencyMessage}</span>
            </div>
          )}

          <AnalysisContent text={result} />

          <div className="pain-result-note">
            <Stethoscope size={19} />
            <div>
              <strong>
                Sağlamlığınla bağlı qərarları diqqətlə ver
              </strong>
              <p>
                Bu hesabat tibbi diaqnoz deyil. Əlamətlər davam
                edərsə, pisləşərsə və ya narahatlıq doğurarsa,
                həkimə müraciət et. Təcili simptomlarda AI cavabını
                gözləmə.
              </p>
            </div>
          </div>
        </section>
      )}

      <footer className="pain-footer">
        <ShieldCheck size={16} />
        <span>
          Tibbi məlumatlandırma · Məxfilik və təhlükəsizlik
          nəzərə alınır
        </span>
      </footer>
    </main>
  );
}

useGLTF.preload("/models/human-body.glb");