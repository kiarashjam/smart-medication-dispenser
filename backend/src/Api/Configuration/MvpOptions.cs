namespace SmartMedicationDispenser.Api.Configuration;

/// <summary>MVP product mode — exposed on public health for clients and operators.</summary>
public class MvpOptions
{
    public const string SectionName = "Mvp";

    /// <summary>When true, API reports mvp in /health responses and uses MVP integration contracts.</summary>
    public bool Enabled { get; set; } = true;

    /// <summary>Human-readable build label (e.g. mvp-1).</summary>
    public string Label { get; set; } = "mvp-1";
}
