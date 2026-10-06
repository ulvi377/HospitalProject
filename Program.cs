
using System.Text;
using Hospital.Data;
using Hospital.Interfaces;
using Hospital.Models;
using Hospital.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Database
var connectionString = builder.Configuration
    .GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<HospitalDbContext>(options =>
    options.UseSqlServer(connectionString));

// Identity
builder.Services
    .AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<HospitalDbContext>()
    .AddDefaultTokenProviders();

// JWT
var jwtKey = builder.Configuration["Jwt:Key"];

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
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey!)
            ),

            ClockSkew = TimeSpan.Zero
        };
    });

// Cloudinary
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();

// Email
builder.Services.AddScoped<IEmailService, EmailService>();

// Appointment Reminder
builder.Services.AddHostedService<AppointmentReminderService>();

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "bearer",
        new Microsoft.OpenApi.OpenApiSecurityScheme
        {
            Type = Microsoft.OpenApi.SecuritySchemeType.Http,
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

    // Rollari yarat
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
                    role +
                    " | " +
                    string.Join(
                        ", ",
                        roleResult.Errors.Select(e => e.Description)
                    )
                );
            }
        }
    }

    // Initial Admin
    const string adminEmail = "admin@hospital.az";
    const string adminPassword = "Admin123!";

    var adminUser = await userManager.FindByEmailAsync(
        adminEmail);

    // Admin yoxdursa yarat
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
                        e => e.Description
                    )
                )
            );
        }
    }

    // Admin role yoxdursa ver
    if (!await userManager.IsInRoleAsync(
            adminUser,
            "Admin"))
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
                        e => e.Description
                    )
                )
            );
        }
    }
}

// Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Test endpoint
app.MapGet("/", () => "Hospital API is working!");

// Controllers
app.MapControllers();

app.Run();
