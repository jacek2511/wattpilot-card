import { html, LitElement, TemplateResult, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('wattpilot-card-editor')
export class WattpilotCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @state() private _config?: any;

  public setConfig(config: any): void {
    this._config = config;
  }

  private _configChanged(ev: any): void {
    if (!this._config || !this.hass) return;
    const target = ev.target;
    const value = target.value;
    const configValue = target.configValue;

    if (this._config[configValue] === value) return;

    const config = { ...this._config };
    if (value === '') {
      delete config[configValue];
    } else {
      config[configValue] = value;
    }

    const event = new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) return html``;

    // Pobranie i posortowanie wszystkich dostępnych encji z Home Assistant
    const entities = Object.keys(this.hass.states).sort();

    return html`
      <div class="card-config">
        <ha-textfield
          label="Nazwa karty (opcjonalna)"
          .value="${this._config.name || ''}"
          .configValue="${'name'}"
          @input="${this._configChanged}"
        ></ha-textfield>

        <div class="section-title">Główne encje zasilania i statusu</div>
        ${this._renderEntitySelect('Status urządzenia', 'entity_status', entities)}
        ${this._renderEntitySelect('Status ładowania (Charging)', 'entity_charging', entities)}
        ${this._renderEntitySelect('Aktualna Moc (Power)', 'entity_power', entities)}
        ${this._renderEntitySelect('Główny Prąd (Current)', 'entity_current', entities)}
        ${this._renderEntitySelect('Energia Sesji (Session Energy)', 'entity_session_energy', entities)}
        ${this._renderEntitySelect('Całkowita Energia (Energy)', 'entity_energy', entities)}
        ${this._renderEntitySelect('Powód Statusu (Reason)', 'entity_reason', entities)}

        <div class="section-title">Bateria i Zasięg</div>
        ${this._renderEntitySelect('Stan Baterii % (SOC)', 'entity_soc', entities)}
        ${this._renderEntitySelect('Max Pojemność % (SOC Max)', 'entity_soc_max', entities)}
        ${this._renderEntitySelect('Docelowy % (Target SOC)', 'entity_target_soc', entities)}
        ${this._renderEntitySelect('Czas do końca (Charge End)', 'entity_charge_end', entities)}
        ${this._renderEntitySelect('Zasięg (Range)', 'entity_range', entities)}
        ${this._renderEntitySelect('Max Zasięg (Range Max)', 'entity_range_max', entities)}

        <div class="section-title">Sterowanie i Tryby</div>
        ${this._renderEntitySelect('Tryb Pracy (Mode)', 'entity_mode', entities)}
        ${this._renderEntitySelect('Tryb Faz (Phase)', 'entity_phase', entities)}
        ${this._renderEntitySelect('Przycisk: Start', 'entity_start', entities)}
        ${this._renderEntitySelect('Przycisk: Stop', 'entity_stop', entities)}
        ${this._renderEntitySelect('Przycisk: Force', 'entity_force', entities)}
        ${this._renderEntitySelect('Przycisk: Restart', 'entity_restart', entities)}

        <div class="section-title">Informacje i Diagnostyka</div>
        ${this._renderEntitySelect('Całkowicie naładowano (Total Charged)', 'entity_total_charged', entities)}
        ${this._renderEntitySelect('Aktualizacja Firmware', 'entity_firmware_update', entities)}
        ${this._renderEntitySelect('WiFi: Status', 'entity_wifi_state', entities)}
        ${this._renderEntitySelect('WiFi: Połączenie', 'entity_wifi_conn', entities)}
        ${this._renderEntitySelect('WiFi: Sygnał', 'entity_wifi_signal', entities)}
      </div>
    `;
  }

  /**
   * Funkcja pomocnicza do generowania listy rozwijanej (ha-select)
   */
  private _renderEntitySelect(label: string, configValue: string, entities: string[]): TemplateResult {
    return html`
      <ha-select
        label="${label}"
        .value="${this._config[configValue] || ''}"
        .configValue="${configValue}"
        @selected="${this._configChanged}"
        @closed="${(ev: any) => ev.stopPropagation()}"
        clearable
      >
        ${entities.map((entity) => html`<mwc-list-item .value="${entity}">${entity}</mwc-list-item>`)}
      </ha-select>
    `;
  }

  static styles = css`
    .card-config {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-bottom: 16px;
    }
    .section-title {
      margin-top: 16px;
      font-size: 14px;
      font-weight: 500;
      color: var(--secondary-text-color);
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 4px;
    }
    ha-select, ha-textfield {
      width: 100%;
    }
  `;
}
