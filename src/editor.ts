import { LitElement, html, css, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

export class WattpilotCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @state() private _config?: any;

  public setConfig(config: any): void {
    // Ważne: Tworzymy kopię konfiguracji
    this._config = JSON.parse(JSON.stringify(config));
  }

  private _getValue(key: string) {
    return this._config ? this._config[key] : '';
  }

  private _valueChanged(ev: any): void {
    if (!this._config || !this.hass) return;
    
    const target = ev.target;
    const configKey = target.configValue;
    
    // Kluczowa poprawka: pobieramy ev.detail.value (standard w HA)
    const newValue = ev.detail?.value !== undefined ? ev.detail.value : target.value;

    if (this._getValue(configKey) === newValue) return;

    const newConfig = { ...this._config };
    if (newValue === "" || newValue === undefined) {
      delete newConfig[configKey];
    } else {
      newConfig[configKey] = newValue;
    }

    // Wysyłamy zdarzenie zmiany do HA
    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  render(): TemplateResult {
    if (!this.hass || !this._config) return html``;

    const groups = [
      {
        label: "Status & Core Entities",
        fields: [
          { key: "entity_status", label: "Car State" },
          { key: "entity_reason", label: "Charging Reason" },
          { key: "entity_charging", label: "Charging (Connected)" },
          { key: "entity_power", label: "Charging Power" },
          { key: "entity_energy", label: "Grid/Home Balance" },
          { key: "entity_session_energy", label: "Session Energy" },
          { key: "entity_total_charged", label: "Total Charged" },
        ]
      },
      {
        label: "Main Controls",
        fields: [
          { key: "entity_current", label: "Charging Current" },
          { key: "entity_mode", label: "Charging Mode" },
          { key: "entity_phase", label: "Phase Switch" },
          { key: "entity_charge_pause", label: "Charge Pause" },
          { key: "entity_start", label: "Start Button" },
          { key: "entity_stop", label: "Stop Button" },
          { key: "entity_force", label: "Force Start" },
          { key: "entity_restart", label: "Restart Button" },
        ]
      },
      {
        label: "Vehicle & Battery",
        fields: [
          { key: "entity_soc", label: "Current SoC" },
          { key: "entity_soc_max", label: "Maximum SoC" },
          { key: "entity_target_soc", label: "Target SoC" },
          { key: "entity_min_soc", label: "Minimum SoC" },
          { key: "entity_range", label: "Range (km)" },
          { key: "entity_charge_end", label: "Time Left" },
        ]
      },
      {
        label: "Smart & Technical",
        fields: [
          { key: "entity_pv_surplus", label: "PV Surplus" },
          { key: "entity_pv_threshold", label: "PV Threshold" },
          { key: "entity_boost", label: "Boost Switch" },
          { key: "entity_lock", label: "Lock Level" },
          { key: "entity_cable_unlock", label: "Cable Unlock" },
          { key: "entity_led_save", label: "LED Saving" },
        ]
      }
    ];

    return html`
      <div class="card-config">
        ${groups.map(group => html`
          <div class="group">
            <div class="group-label">${group.label}</div>
            <div class="grid">
              ${group.fields.map(f => html`
                <ha-entity-picker
                  label="${f.label}"
                  .hass=${this.hass}
                  .value=${this._getValue(f.key)}
                  .configValue=${f.key}
                  @value-changed=${this._valueChanged}
                  allow-custom-entity
                ></ha-entity-picker>
              `)}
            </div>
          </div>
        `)}

        <div class="group">
          <div class="group-label">Side Columns (Left/Right)</div>
          <p class="note">
            Configuration for columns (icons, color rules) must be managed via the YAML Code Editor.
          </p>
        </div>
      </div>
    `;
  }

  static styles = css`
    .card-config { display: flex; flex-direction: column; gap: 12px; }
    .group { border: 1px solid var(--divider-color); border-radius: 8px; padding: 12px; background: var(--secondary-background-color); }
    .group-label { font-weight: bold; margin-bottom: 12px; color: var(--primary-color); text-transform: uppercase; font-size: 11px; letter-spacing: 0.8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    ha-entity-picker { width: 100%; }
    .note { font-size: 12px; color: var(--secondary-text-color); margin: 0; }
    @media (max-width: 450px) { .grid { grid-template-columns: 1fr; } }
  `;
}

customElements.define('wattpilot-card-editor', WattpilotCardEditor);
