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

    const entities = Object.keys(this.hass.states).sort();

    // Mapowanie pól konfiguracji z Twojego pliku JS
    const configFields = [
      { label: 'Name', value: 'name' },
      { label: 'L1 Power Entity', value: 'entity_l1_power' },
      { label: 'L2 Power Entity', value: 'entity_l2_power' },
      { label: 'L3 Power Entity', value: 'entity_l3_power' },
      { label: 'Current Price Entity', value: 'entity_current_price' },
      { label: 'Max Price Entity', value: 'entity_max_price' },
      { label: 'Next Trip Timing Entity', value: 'entity_next_trip_timing' },
      { label: 'Firmware Update Entity', value: 'entity_firmware_update' },
      { label: 'Internal Error Entity', value: 'entity_internal_error' }
    ];

    return html`
      <div class="card-config">
        ${configFields.map(field => html`
          <ha-select
            label="${field.label}"
            .value="${this._config[field.value] || ''}"
            .configValue="${field.value}"
            @selected="${this._configChanged}"
            @closed="${(ev: any) => ev.stopPropagation()}"
          >
            ${entities.map(entity => html`<mwc-list-item .value="${entity}">${entity}</mwc-list-item>`)}
          </ha-select>
        `)}
      </div>
    `;
  }

  static styles = css`
    ha-select {
      width: 100%;
      margin-bottom: 12px;
    }
  `;
}
