SELECT
    p.Id AS PatientId,
    p.FullName,
    u.Email,
    STRING_AGG(r.Name, ', ') AS UserRole
FROM dbo.Patients p
LEFT JOIN dbo.AspNetUsers u
    ON u.Id = p.UserId
LEFT JOIN dbo.AspNetUserRoles ur
    ON ur.UserId = u.Id
LEFT JOIN dbo.AspNetRoles r
    ON r.Id = ur.RoleId
GROUP BY
    p.Id,
    p.FullName,
    u.Email
ORDER BY p.Id;