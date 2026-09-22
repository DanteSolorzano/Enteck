using Backend_EnTeck.Data;
using Backend_EnTeck.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

// Signup endpoint
app.MapPost("/api/auth/signup", async (SignupRequest request, ApplicationDbContext db) =>
{
    // Validate required input
    if (string.IsNullOrWhiteSpace(request.Nombre) || 
        string.IsNullOrWhiteSpace(request.Telefono) || 
        string.IsNullOrWhiteSpace(request.Correo) || 
        string.IsNullOrWhiteSpace(request.Contrasena))
    {
        return Results.BadRequest(new { message = "Nombre, Telefono, Correo, and Contrasena are required" });
    }

    // Check if user already exists
    var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Correo == request.Correo);
    if (existingUser != null)
    {
        return Results.Conflict(new { message = "Email already registered" });
    }

    // Create new user
    var user = new User
    {
        Nombre = request.Nombre,
        Telefono = request.Telefono,
        Correo = request.Correo,
        Contrasena = request.Contrasena, // TODO: Hash password before storing
        Direccion = request.Direccion
    };

    db.Users.Add(user);
    await db.SaveChangesAsync();

    return Results.Created($"/api/auth/signup/{user.Id}", new { id = user.Id, correo = user.Correo, nombre = user.Nombre });
})
.WithName("Signup")
.WithOpenApi();

// Login endpoint
app.MapPost("/api/auth/login", async (SignupRequest request, ApplicationDbContext db) =>
{
    // Validate input
    if (string.IsNullOrWhiteSpace(request.Correo) || string.IsNullOrWhiteSpace(request.Contrasena))
    {
        return Results.BadRequest(new { message = "Correo and Contrasena are required" });
    }

    // Check if user exists
    var user = await db.Users.FirstOrDefaultAsync(u => u.Correo == request.Correo);
    if (user == null)
    {
        return Results.Unauthorized();
    }

    // Check if password matches
    if (user.Contrasena != request.Contrasena)
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new { id = user.Id });
})
.WithName("Login")
.WithOpenApi();

// Get all clients endpoint
app.MapGet("/api/clients", async (ApplicationDbContext db) =>
{
    var clientes = await db.Users.ToListAsync();
    
    var resultado = clientes.Select(c => new 
    { 
        id = c.Id, 
        nombre = c.Nombre,
        telefono = c.Telefono,
        correo = c.Correo,
        direccion = c.Direccion
    }).ToList();

    return Results.Ok(resultado);
})
.WithName("GetAllClients")
.WithOpenApi();

// Get all service orders endpoint
app.MapGet("/api/service-order", async (ApplicationDbContext db) =>
{
    var solicitudes = await db.SolicitudServicios.ToListAsync();
    
    var resultado = solicitudes.Select(s => new 
    { 
        id = s.Id, 
        marca = s.Marca,
        modelo = s.Modelo,
        problema = s.Problema,
        estado = s.Estado,
        fechaRecibido = s.FechaRecibido,
        eta = s.Eta,
        idCliente = s.IdCliente
    }).ToList();

    return Results.Ok(resultado);
})
.WithName("GetAllServiceOrders")
.WithOpenApi();

// Get all service orders by client ID endpoint
app.MapGet("/api/service-order/client/{idCliente}", async (int idCliente, ApplicationDbContext db) =>
{
    var solicitudes = await db.SolicitudServicios
        .Where(s => s.IdCliente == idCliente)
        .ToListAsync();
    
    if (solicitudes == null || solicitudes.Count == 0)
    {
        return Results.NotFound(new { message = "No service orders found for this client" });
    }

    var resultado = solicitudes.Select(s => new 
    { 
        id = s.Id, 
        marca = s.Marca,
        modelo = s.Modelo,
        problema = s.Problema,
        estado = s.Estado,
        fechaRecibido = s.FechaRecibido,
        eta = s.Eta,
        idCliente = s.IdCliente
    }).ToList();

    return Results.Ok(resultado);
})
.WithName("GetServiceOrdersByClient")
.WithOpenApi();

// Get client info by ID endpoint
app.MapGet("/api/clients/{id}", async (int id, ApplicationDbContext db) =>
{
    var cliente = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
    if (cliente == null)
    {
        return Results.NotFound(new { message = "Cliente not found" });
    }

    return Results.Ok(new 
    { 
        id = cliente.Id, 
        nombre = cliente.Nombre,
        telefono = cliente.Telefono,
        correo = cliente.Correo,
        direccion = cliente.Direccion
    });
})
.WithName("GetClientInfo")
.WithOpenApi();

// Delete client endpoint
app.MapDelete("/api/clients/{id}", async (int id, ApplicationDbContext db) =>
{
    var cliente = await db.Users.FirstOrDefaultAsync(u => u.Id == id);
    if (cliente == null)
    {
        return Results.NotFound(new { message = "Cliente not found" });
    }

    db.Users.Remove(cliente);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = "Cliente deleted successfully" });
})
.WithName("DeleteClient")
.WithOpenApi();

// Service order registration endpoint
app.MapPost("/api/service-order", async (ServiceOrderRequest request, ApplicationDbContext db) =>
{
    // Validate required input
    if (string.IsNullOrWhiteSpace(request.Marca) || 
        string.IsNullOrWhiteSpace(request.Modelo) || 
        string.IsNullOrWhiteSpace(request.Problema) ||
        string.IsNullOrWhiteSpace(request.Estado) ||
        request.IdCliente <= 0)
    {
        return Results.BadRequest(new { message = "Marca, Modelo, Problema, Estado, and IdCliente are required" });
    }

    // Check if client exists
    var cliente = await db.Users.FirstOrDefaultAsync(u => u.Id == request.IdCliente);
    if (cliente == null)
    {
        return Results.NotFound(new { message = "Cliente not found" });
    }

    // Create new service order
    var solicitud = new SolicitudServicio
    {
        Marca = request.Marca,
        Modelo = request.Modelo,
        Problema = request.Problema,
        Estado = request.Estado,
        FechaRecibido = DateTime.Now,
        Eta = request.Eta,
        IdCliente = request.IdCliente
    };

    db.SolicitudServicios.Add(solicitud);
    await db.SaveChangesAsync();

    return Results.Created($"/api/service-order/{solicitud.Id}", new 
    { 
        id = solicitud.Id, 
        marca = solicitud.Marca,
        modelo = solicitud.Modelo,
        problema = solicitud.Problema,
        estado = solicitud.Estado,
        fechaRecibido = solicitud.FechaRecibido,
        eta = solicitud.Eta,
        idCliente = solicitud.IdCliente
    });
})
.WithName("CreateServiceOrder")
.WithOpenApi();

// Get service order by ID endpoint
app.MapGet("/api/service-order/{id}", async (int id, ApplicationDbContext db) =>
{
    var solicitud = await db.SolicitudServicios.FirstOrDefaultAsync(s => s.Id == id);
    if (solicitud == null)
    {
        return Results.NotFound(new { message = "Service order not found" });
    }

    return Results.Ok(new 
    { 
        id = solicitud.Id, 
        marca = solicitud.Marca,
        modelo = solicitud.Modelo,
        problema = solicitud.Problema,
        estado = solicitud.Estado,
        fechaRecibido = solicitud.FechaRecibido,
        eta = solicitud.Eta,
        idCliente = solicitud.IdCliente
    });
})
.WithName("GetServiceOrder")
.WithOpenApi();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
