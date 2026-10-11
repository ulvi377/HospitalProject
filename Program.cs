using System.Text;
using Hospital.Data;
using Hospital.Interfaces;
using Hospital.Models;
using Hospital.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// HTTP Client
builder.Services.AddHttpClient();

// Database
var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<HospitalDbContext>(options =>
    options.UseSqlServer(connectionString));

// Identity
builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>(options =>
    {
        options.SignIn.RequireConfirmedEmail = true;

        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
        options.Password.RequireNonAlphanumeric = true;

        options.User.RequireUniqueEmail = true;
    })
    .AddEntityFrameworkStores<HospitalDbContext>()
    .AddDefaultTokenProviders();

// JWT Configuration
var jwtKey = builder.Configuration["Jwt:Key"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new Exception(
        "Jwt:Key User Secrets daxilinde tapilmadi.");
}

var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

// Authentication: JWT + Google
builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = jwtIssuer,
                ValidAudience = jwtAudience,

                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey)),

                ClockSkew = TimeSpan.Zero
            };
    })
    .AddGoogle("Google", options =>
    {
        options.ClientId =
            builder.Configuration[
                "Authentication:Google:ClientId"]!;

        options.ClientSecret =
            builder.Configuration[
                "Authentication:Google:ClientSecret"]!;

        // Google middleware callback
        options.CallbackPath = "/signin-google";

        // Xarici Google hesabinin melumatlarini saxlayan scheme
        options.SignInScheme =
            IdentityConstants.ExternalScheme;

        // OAuth state ucun cookie parametrlari
        options.CorrelationCookie.SameSite =
            SameSiteMode.Lax;

        options.CorrelationCookie.SecurePolicy =
            CookieSecurePolicy.SameAsRequest;
    });

// Application Services
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddHostedService<AppointmentReminderService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// AutoMapper
builder.Services.AddAutoMapper(
    cfg => { },
    typeof(Program).Assembly);

// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "bearer",
        new Microsoft.OpenApi.OpenApiSecurityScheme
        {
            Type =
                Microsoft.OpenApi.SecuritySchemeType.Http,

            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "JWT token daxil edin."
        });

    options.AddSecurityRequirement(document =>
        new Microsoft.OpenApi.OpenApiSecurityRequirement
        {
            [new Microsoft.OpenApi.OpenApiSecuritySchemeReference(
                "bearer",
                document)] = []
        });
});

var app = builder.Build();

// Role Seeder + Initial Admin
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    var userManager = scope.ServiceProvider
        .GetRequiredService<UserManager<ApplicationUser>>();

    string[] roles =
    {
        "Admin",
        "Doctor",
        "Patient"
    };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            var roleResult = await roleManager.CreateAsync(
                new IdentityRole(role));

            if (!roleResult.Succeeded)
            {
                throw new Exception(
                    "Role yaradila bilmedi: " +
                    role + " | " +
                    string.Join(
                        ", ",
                        roleResult.Errors.Select(
                            e => e.Description)));
            }
        }
    }

    const string adminEmail = "admin@hospital.com";
    const string adminPassword = "Admin123!";

    var adminUser = await userManager.FindByEmailAsync(
        adminEmail);

    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FullName = "Hospital Admin",
            EmailConfirmed = true
        };

        var createAdminResult = await userManager.CreateAsync(
            adminUser,
            adminPassword);

        if (!createAdminResult.Succeeded)
        {
            throw new Exception(
                "Initial Admin yaradilmasi ugursuz oldu: " +
                string.Join(
                    ", ",
                    createAdminResult.Errors.Select(
                        e => e.Description)));
        }
    }

    if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
    {
        var adminRoleResult = await userManager.AddToRoleAsync(
            adminUser,
            "Admin");

        if (!adminRoleResult.Succeeded)
        {
            throw new Exception(
                "Admin rolu teyin edile bilmedi: " +
                string.Join(
                    ", ",
                    adminRoleResult.Errors.Select(
                        e => e.Description)));
        }
    }
}

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Hospital API is working!");

app.MapControllers();

app.Run();