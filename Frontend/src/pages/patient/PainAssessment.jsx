
import { Suspense, useMemo, useState } from "react";
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
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import api from "../../services/api";
import "./PainAssessment.css";

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

function HumanModel({ view, onSelect }) {
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

    // Klik nöqtəsini ilkin model koordinatlarına çevir.
    const clickedPoint = event.point.clone();

    const worldMatrix = event.object.matrixWorld;
    const inverseWorldMatrix = new THREE.Matrix4()
      .copy(worldMatrix)
      .invert();

    clickedPoint.applyMatrix4(inverseWorldMatrix);

    // Klik nöqtəsini modelin öz koordinat sisteminə gətir.
    const localPoint = event.object.localToWorld(
      new THREE.Vector3()
    );

    localPoint.copy(event.point);
    model.updateMatrixWorld(true);

    const modelInverse = new THREE.Matrix4()
      .copy(model.matrixWorld)
      .invert();

    localPoint.applyMatrix4(modelInverse);

    // Modelin hündürlük və en sərhədləri.
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
        const isLeft = normalizedX < 0.5;
        const leftSide = view === "front" ? isLeft : !isLeft;

        selectedRegion = leftSide ? "Sol qol" : "Sağ qol";
      } else {
        selectedRegion = view === "front" ? "Sinə" : "Bel";
      }
    } else if (normalizedY >= 0.39) {
      selectedRegion = view === "front" ? "Qarın" : "Bel";
    } else if (normalizedY >= 0.29) {
      selectedRegion = "Çanaq";
    } else {
      const isLeft = normalizedX < 0.5;
      const leftSide = view === "front" ? isLeft : !isLeft;

      selectedRegion = leftSide ? "Sol ayaq" : "Sağ ayaq";
    }

    onSelect(selectedRegion);
  };

  return (
    <group
      rotation={[0, view === "back" ? Math.PI : 0, 0]}
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
        color="#7897b0"
        roughness={0.8}
      />
    </mesh>
  );
}

export default function PainAssessment() {
  const [view, setView] = useState("front");
  const [region, setRegion] = useState("");
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
        "Qeyd etdiyin simptomlar təcili tibbi qiymətləndirmə tələb edə bilər. AI nəticəsini gözləmə; dərhal tibbi yardım al."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/PainAssessment/analyze", {
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
      });

      setResult(
        response.data?.analysis ||
          "AI analiz nəticəsi qaytarılmadı."
      );

      if (response.data?.emergencyMessage) {
        setEmergencyMessage(response.data.emergencyMessage);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Analiz zamanı xəta baş verdi. Backend-in işlədiyini və API açarının düzgün qurulduğunu yoxla."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setView("front");
    setRegion("");
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
      <header className="pain-header">
        <div>
          <div className="pain-eyebrow">
            <Activity size={15} />
            AI HEALTH ASSISTANT
          </div>

          <h1>Ağrı qiymətləndirməsi</h1>

          <p>
            Ağrıyan nahiyəni seç, simptomlarını qeyd et və
            ilkin məlumatlandırıcı analiz al.
          </p>
        </div>

        <div className="pain-secure">
          <ShieldCheck size={18} />
          <span>Tibbi məlumatlandırma</span>
        </div>
      </header>

      <div className="pain-disclaimer">
        <AlertTriangle size={19} />
        <p>
          Bu alət diaqnoz qoymur və həkim müayinəsini əvəz etmir.
          Güclü və ya qəfil başlayan simptomlarda tibbi yardım al.
        </p>
      </div>

      <form className="pain-layout" onSubmit={analyzePain}>
        <section className="pain-card pain-model-card">
          <div className="pain-card-heading">
            <div>
              <span className="pain-step">ADDIM 01</span>
              <h2>Ağrıyan nahiyəni seç</h2>
            </div>

            <span className="pain-model-tag">3D BODY</span>
          </div>

          <div className="pain-view-switch">
            <button
              type="button"
              className={view === "front" ? "active" : ""}
              onClick={() => setView("front")}
            >
              Ön tərəf
            </button>

            <button
              type="button"
              className={view === "back" ? "active" : ""}
              onClick={() => setView("back")}
            >
              Arxa tərəf
            </button>
          </div>

          <div className="pain-canvas">
            <Canvas
              camera={{
                position: [0, 0.15, 4.5],
                fov: 38,
              }}
              gl={{
                antialias: true,
                alpha: false,
              }}
              shadows
            >
              <color attach="background" args={["#91b1ca"]} />

              <fog attach="fog" args={["#91b1ca", 8, 14]} />

              <ambientLight intensity={0.65} />

              <directionalLight
                position={[3, 4, 5]}
                intensity={1.3}
                color="#ffffff"
                castShadow
              />

              <directionalLight
                position={[-3, 2, -4]}
                intensity={0.5}
                color="#a8c8df"
              />

              <directionalLight
                position={[0, 1, 3]}
                intensity={0.45}
                color="#d6e8f5"
              />

              <Environment preset="studio" />

              <Suspense fallback={<ModelFallback />}>
                <HumanModel
                  view={view}
                  onSelect={setRegion}
                />
              </Suspense>

              <OrbitControls
                enablePan={false}
                minDistance={2.5}
                maxDistance={6}
                minPolarAngle={0.5}
                maxPolarAngle={2.5}
              />
            </Canvas>

            <div className="pain-model-hint">
              <ArrowLeftRight size={15} />
              Modeli fırlatmaq üçün sürüşdür, ağrıyan yerə kliklə
            </div>
          </div>

          <div className="pain-selected">
            <span>Seçilmiş nahiyə</span>
            <strong>{region || "Hələ seçilməyib"}</strong>
          </div>

          <div className="pain-region-list">
            {bodyRegions.map((item) => (
              <button
                type="button"
                key={item}
                className={region === item ? "selected" : ""}
                onClick={() => setRegion(item)}
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
              <span className="pain-step">ADDIM 02</span>
              <h2>Simptomları qeyd et</h2>
            </div>

            <Activity size={22} className="pain-heading-icon" />
          </div>

          <div className="pain-field">
            <div className="pain-label-row">
              <label htmlFor="pain-severity">Ağrının dərəcəsi</label>
              <strong className="pain-score">{severity}/10</strong>
            </div>

            <input
              id="pain-severity"
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="pain-slider"
            />

            <div className="pain-range-labels">
              <span>Yüngül</span>
              <span>Orta</span>
              <span>Şiddətli</span>
            </div>
          </div>

          <div className="pain-field">
            <label htmlFor="pain-duration">Nə vaxtdan ağrıyır?</label>

            <select
              id="pain-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
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
            <label htmlFor="pain-type">Ağrının növü</label>

            <select
              id="pain-type"
              value={painType}
              onChange={(e) => setPainType(e.target.value)}
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

          <div className="pain-field">
            <label>Əlavə simptomlar</label>

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

                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pain-field">
            <label htmlFor="pain-notes">
              Əlavə məlumat (məcburi deyil)
            </label>

            <textarea
              id="pain-notes"
              rows="3"
              maxLength="1000"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Məsələn, hərəkət edəndə ağrı artır..."
            />
          </div>

          {error && (
            <div className="pain-error" role="alert">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {emergencyMessage && (
            <div className="pain-error" role="alert">
              <AlertTriangle size={18} />
              <span>{emergencyMessage}</span>
            </div>
          )}

          <button
            type="submit"
            className="pain-analyze-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle className="pain-spin" size={19} />
                Analiz edilir...
              </>
            ) : (
              <>
                <BrainCircuit size={19} />
                AI ilə analiz et
              </>
            )}
          </button>

          {result && (
            <div className="pain-result">
              <div className="pain-result-title">
                <CheckCircle2 size={21} />
                <h3>Analiz nəticəsi</h3>
              </div>

              <div className="pain-result-text">{result}</div>

              <div className="pain-result-note">
                <Stethoscope size={17} />
                Nəticəni həkimlə müzakirə et. Bu, diaqnoz deyil.
              </div>
            </div>
          )}
        </section>
      </form>
    </main>
  );
}

useGLTF.preload("/models/human-body.glb");
