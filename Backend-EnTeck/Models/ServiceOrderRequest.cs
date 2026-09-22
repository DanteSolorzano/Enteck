namespace Backend_EnTeck.Models;

public class ServiceOrderRequest
{
    public int IdCliente { get; set; }
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public string Problema { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime? Eta { get; set; }
}
