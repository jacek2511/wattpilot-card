import { LitElement, html, css, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

export class WattpilotCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @state() private _config?: any;

  public setConfig(config: any): void {
    this._config = config;
  }

  private _getEntityId(key: string): string {
    const value = this._config?.[key];
    if (!value) return '';
    return typeof value === 'object' ? value.entity : value;
  }

  private _getAttribute(key: string): string {
    const value = this._config?.[key];
    return (value && typeof value === 'object') ? value.attribute || '' : '';
  }

  private _getOtherValue(slot: string, key: string): string {
    return this._config?.[slot]?.[key] || '';
  }

  private _clearValue(key: string, field: string = 'entity'): void {
    const newConfig = JSON.parse(JSON.stringify(this._config));
    if (field === 'entity') {
      delete newConfig[key];
    } else {
      if (newConfig[key] && typeof newConfig[key] === 'object') {
        delete newConfig[key][field];
        // Jeśli został tylko klucz entity, konwertuj z powrotem na string
        if (Object.keys(newConfig[key]).length === 1 && newConfig[key].entity) {
           newConfig[key] = newConfig[key].entity;
        }
      }
    }
    this._config = newConfig;
    this._dispatch(newConfig);
  }

  private _handleValueChanged(ev: CustomEvent, key: string, field: string = 'entity'): void {
    if (!this._config || !this.hass) return;
    const newValue = ev.detail.value;
    const newConfig = JSON.parse(JSON.stringify(this._config));

    if (field === 'entity') {
      if (!newValue) {
        delete newConfig[key];
      } else {
        if (typeof newConfig[key] === 'object' && !Array.isArray(newConfig[key])) {
          newConfig[key].entity = newValue;
        } else {
          newConfig[key] = newValue;
        }
      }
    } else {
      if (!newConfig[key] || typeof newConfig[key] !== 'object') {
        const currentEntity = typeof newConfig[key] === 'string' ? newConfig[key] : '';
        newConfig[key] = { entity: currentEntity };
      }
      newConfig[key][field] = newValue;
    }
    this._config = newConfig;
    this._dispatch(newConfig);
  }

  private _toggleAttribute(key: string): void {
    const newConfig = JSON.parse(JSON.stringify(this._config));
    const currentVal = newConfig[key];
    if (typeof currentVal === 'object' && currentVal.attribute !== undefined) {
      delete currentVal.attribute;
      if (Object.keys(currentVal).length === 1 && currentVal.entity) newConfig[key] = currentVal.entity;
    } else {
      const entityId = typeof currentVal === 'string' ? currentVal : (currentVal?.entity || '');
      newConfig[key] = { entity: entityId, attribute: "" };
    }
    this._config = newConfig;
    this._dispatch(newConfig);
  }

  // --- COLOR RULES ---
  private _addColorRule(slot: string) {
    const newConfig = JSON.parse(JSON.stringify(this._config));
    if (typeof newConfig[slot] !== 'object') {
      newConfig[slot] = { entity: newConfig[slot] || "" };
    }
    if (!newConfig[slot].color_rules) newConfig[slot].color_rules = [];
    newConfig[slot].color_rules.push({ value: 0, color: "#9ca3af" });
    this._config = newConfig;
    this._dispatch(newConfig);
  }

  private _updateColorRule(slot: string, index: number, field: 'value' | 'color', value: any) {
    const newConfig = JSON.parse(JSON.stringify(this._config));
    const val = field === 'value' ? parseFloat(value) : value;
    newConfig[slot].color_rules[index][field] = val;
    this._config = newConfig;
    this._dispatch(newConfig);
  }

  private _removeColorRule(slot: string, index: number) {
    const newConfig = JSON.parse(JSON.stringify(this._config));
    newConfig[slot].color_rules.splice(index, 1);
    if (newConfig[slot].color_rules.length === 0) delete newConfig[slot].color_rules;
    this._config = newConfig;
    this._dispatch(newConfig);
  }

  private _dispatch(config: any): void {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  }

  private renderEntityRow(key: string, label: string): TemplateResult {
    const entityId = this._getEntityId(key);
    const stateObj = entityId ? this.hass.states[entityId] : null;
    const baseAttrs = ['friendly_name', 'icon', 'unit_of_measurement', 'device_class', 'state_class', 'restored', 'supported_features', 'attribution', 'description'];
    const hasExtraAttributes = stateObj && Object.keys(stateObj.attributes).some(attr => !baseAttrs.includes(attr));
    const isObject = typeof this._config[key] === 'object';

    return html`
      <div class="field-row">
        <div class="selector-container">
          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: {} }}
            .value=${entityId}
            .label=${label}
            @value-changed=${(ev: any) => this._handleValueChanged(ev, key, 'entity')}
          ></ha-selector>
          <ha-icon-button class="clear-btn" title="Clear Entity" @click=${() => this._clearValue(key, 'entity')}>
            <ha-icon icon="hass:close"></ha-icon>
          </ha-icon-button>
          
          ${hasExtraAttributes ? html`
            <div class="checkbox-container" title="Use Attribute">
              <ha-checkbox .checked=${isObject && this._config[key].attribute !== undefined} @change=${() => this._toggleAttribute(key)}></ha-checkbox>
              <ha-icon icon="hass:file-tree" style="--mdc-icon-size: 14px;"></ha-icon>
            </div>
          ` : ''}
        </div>
        ${isObject && this._config[key].attribute !== undefined ? html`
          <div class="attr-row">
            <div class="selector-container">
              <ha-selector
                .hass=${this.hass}
                .selector=${{ attribute: { entity_id: entityId, hide_attributes: baseAttrs } }}
                .value=${this._getAttribute(key)}
                .label="Attribute for ${label}"
                @value-changed=${(ev: any) => this._handleValueChanged(ev, key, 'attribute')}
              ></ha-selector>
              <ha-icon-button class="clear-btn" title="Clear Attribute" @click=${() => this._clearValue(key, 'attribute')}>
                <ha-icon icon="hass:close"></ha-icon>
              </ha-icon-button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderSideSlot(slot: string, label: string): TemplateResult {
    const colorRules = this._config[slot]?.color_rules || [];

    return html`
      <div class="side-entity-box">
        <div class="side-entity-header">${label}</div>
        ${this.renderEntityRow(slot, `${label} Entity`)}
        <div class="side-tools-grid">
            <div class="selector-container">
                <ha-selector .hass=${this.hass} .selector=${{ icon: {} }} .value=${this._getOtherValue(slot, 'icon')} .label="${label} Icon" @value-changed=${(ev: any) => this._handleValueChanged(ev, slot, 'icon')}></ha-selector>
                <ha-icon-button class="clear-btn" @click=${() => this._clearValue(slot, 'icon')}>
                    <ha-icon icon="hass:close"></ha-icon>
                </ha-icon-button>
            </div>
            <div class="selector-container">
                <ha-selector .hass=${this.hass} .selector=${{ text: {} }} .value=${this._getOtherValue(slot, 'unit')} .label="${label} Unit" @value-changed=${(ev: any) => this._handleValueChanged(ev, slot, 'unit')}></ha-selector>
                <ha-icon-button class="clear-btn" @click=${() => this._clearValue(slot, 'unit')}>
                    <ha-icon icon="hass:close"></ha-icon>
                </ha-icon-button>
            </div>
        </div>
        
        <div class="rules-section">
          <div class="rules-header">
            <span>Color Rules (Thresholds)</span>
            <ha-icon-button class="add-btn" @click=${() => this._addColorRule(slot)} title="Add Rule">
                <ha-icon icon="hass:plus"></ha-icon>
            </ha-icon-button>
          </div>
          ${colorRules.map((rule: any, idx: number) => html`
            <div class="rule-row">
              <ha-selector .hass=${this.hass} .selector=${{ number: { mode: "box", step: 0.1 } }} .value=${rule.value} label="Value" @value-changed=${(ev: any) => this._updateColorRule(slot, idx, 'value', ev.detail.value)}></ha-selector>
              <ha-selector .hass=${this.hass} .selector=${{ ui_color: {} }} .value=${rule.color} label="Color" @value-changed=${(ev: any) => this._updateColorRule(slot, idx, 'color', ev.detail.value)}></ha-selector>
              <ha-icon-button class="delete-btn" @click=${() => this._removeColorRule(slot, idx)}>
                <ha-icon icon="hass:delete-outline"></ha-icon>
              </ha-icon-button>
            </div>
          `)}
        </div>
      </div>
    `;
  }
  
  render(): TemplateResult {
    if (!this.hass || !this._config) return html``;
    const groups = [
      { label: "Status & Core Entities", icon: "hass:information-outline", fields: [{ key: "entity_status", label: "Car State" }, { key: "entity_reason", label: "Charging Reason" }, { key: "entity_charging", label: "Charging (Connected)" }, { key: "entity_power", label: "Charging Power" }, { key: "entity_energy", label: "Grid/Home Balance" }, { key: "entity_session_energy", label: "Session Energy" }, { key: "entity_total_charged", label: "Total Charged (kWh)" }] },
      { label: "Main Controls", icon: "hass:tune", fields: [{ key: "entity_current", label: "Charging Current" }, { key: "entity_mode", label: "Charging Mode" }, { key: "entity_phase", label: "Phase Switch" }, { key: "entity_charge_pause", label: "Charge Pause" }, { key: "entity_start", label: "Start Button" }, { key: "entity_stop", label: "Stop Button" }, { key: "entity_force", label: "Force Start Button" }] },
      { label: "Vehicle & Battery", icon: "hass:car-electric", fields: [{ key: "entity_soc", label: "Current SoC" }, { key: "entity_soc_max", label: "Maximum SoC" }, { key: "entity_target_soc", label: "Target SoC" }, { key: "entity_min_soc", label: "Minimum SoC" }, { key: "entity_range", label: "Range (km)" }, { key: "entity_max_range", label: "Max Range (km)" }, { key: "entity_charge_end", label: "Charging Time Left" }] },
      { label: "Smart Features", icon: "hass:solar-power", fields: [{ key: "entity_next_trip_pwr", label: "Next Trip Energy" }, { key: "entity_next_trip_timing", label: "Next Trip Time" }, { key: "entity_pv_surplus", label: "PV Surplus Switch" }, { key: "entity_pv_threshold", label: "PV Battery Threshold" }, { key: "entity_max_price", label: "Max Price" }, { key: "entity_awattar", label: "Awattar/Lumina Switch" }, { key: "entity_eco_persist", label: "Remain in Eco Mode" }, { key: "entity_start_at", label: "Start Charging At" }] },
      { label: "Boost & Phase Settings", icon: "hass:lightning-bolt-outline", fields: [{ key: "entity_boost", label: "Boost Switch" }, { key: "entity_boost_type", label: "Boost Type" }, { key: "entity_boost_limit", label: "Boost Limit" }, { key: "entity_phase_power", label: "3-Phase Power Level" }, { key: "entity_phase_delay", label: "Phase Switch Delay" }, { key: "entity_phase_interval", label: "Phase Switch Interval" }] },
      { label: "Technical Settings", icon: "hass:cog", fields: [{ key: "entity_lock", label: "Lock Level" }, { key: "entity_cable_unlock", label: "Cable Unlock" }, { key: "entity_sim_unplug", label: "Simulate Unplugging" }, { key: "entity_power_outage", label: "Unlock on Power Outage" }, { key: "entity_ground_check", label: "Ground Check" }, { key: "entity_led_save", label: "LED Energy Saving" }, { key: "entity_min_time", label: "Min Charging Time" }, { key: "entity_restart", label: "Restart Button" }] },
      { label: "System & Network", icon: "hass:wifi", fields: [{ key: "entity_internal_error", label: "Internal Error Sensor" }, { key: "entity_firmware_update", label: "Firmware Update" }, { key: "entity_wifi_state", label: "WiFi State" }, { key: "entity_wifi_conn", label: "WiFi Connection" }, { key: "entity_wifi_signal", label: "WiFi Signal" }, { key: "entity_hotspot_sw", label: "Disable Hotspot Switch" }] }
    ];

    return html`
      <div class="card-config">
        ${groups.map(group => html`
          <ha-expansion-panel outlined>
            <div slot="header" class="header-content">
                <ha-icon .icon=${group.icon} class="header-icon"></ha-icon>
                <span>${group.label}</span>
            </div>
            <div class="fields-container">
              ${group.fields.map(f => this.renderEntityRow(f.key, f.label))}
            </div>
          </ha-expansion-panel>
        `)}

        <ha-expansion-panel outlined>
          <div slot="header" class="header-content">
            <ha-icon icon="hass:palette-outline" class="header-icon"></ha-icon>
            <span>Customize View</span>
          </div>
          <div class="fields-container-nested">
            <ha-expansion-panel outlined header="Left Side Column">
              <div class="fields-container">
                ${[1, 2, 3, 4, 5].map(i => this.renderSideSlot(`left${i}`, `Left ${i}`))}
              </div>
            </ha-expansion-panel>
            <ha-expansion-panel outlined header="Right Side Column">
              <div class="fields-container">
                ${[1, 2, 3, 4, 5].map(i => this.renderSideSlot(`right${i}`, `Right ${i}`))}
              </div>
            </ha-expansion-panel>
          </div>
        </ha-expansion-panel>
      </div>
    `;
  }

static styles = css`
.card-config { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 100%; box-sizing: border-box; }
    ha-expansion-panel { border-radius: 8px; --ha-card-border-radius: 8px; border: 1px solid var(--divider-color); }
    
    .header-content { display: flex; align-items: center; gap: 12px; font-weight: 500; padding: 4px 0; }
    .header-icon { color: var(--primary-color); flex-shrink: 0; }
    
    .fields-container { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: var(--card-background-color); overflow: hidden; }
    .fields-container-nested { display: flex; flex-direction: column; gap: 8px; padding: 8px; background: var(--secondary-background-color); overflow: hidden; }
    
    .field-row { display: flex; flex-direction: column; gap: 4px; width: 100%; min-width: 0; }    
    .selector-container { display: flex; align-items: center; gap: 0px; width: 100%; min-width: 0; }
    ha-selector { flex: 1; min-width: 0; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    ha-icon-button { flex-shrink: 0; --mdc-icon-button-size: 36px; display: flex; align-items: center; justify-content: center; }
    ha-icon { display: block; --mdc-icon-size: 20px; }
    .clear-btn { color: #ff9800 !important; }
    .clear-btn:hover { opacity: 1; background: rgba(255, 152, 0, 0.1); border-radius: 50%; }
    .delete-btn { color: #f44336 !important; }
    .delete-btn:hover { background: rgba(244, 67, 54, 0.1); border-radius: 50%; }
    .add-btn { color: #4caf50 !important; --mdc-icon-size: 24px; }
    
    .checkbox-container { display: flex; flex-direction: column; align-items: center; min-width: 40px; }
    .checkbox-container ha-icon { --mdc-icon-size: 14px; color: var(--secondary-text-color); margin-top: -4px; }
    
    .attr-row { padding-left: 24px; border-left: 3px solid var(--primary-color); margin-top: 4px; }
    .side-entity-box { border-bottom: 2px solid var(--divider-color); padding-bottom: 20px; margin-bottom: 16px; }
    .side-entity-header { font-size: 0.85rem; font-weight: bold; color: var(--primary-color); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
    .side-tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; width: 100%; min-width: 0; }
    
    .rules-section { margin-top: 16px; background: var(--card-background-color); padding: 12px; border-radius: 8px; border: 1px dashed var(--divider-color); min-width: 0; }
    .rules-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: 600; color: var(--primary-text-color); margin-bottom: 8px; }
    .rule-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; margin-top: 10px; align-items: center; border-top: 1px solid var(--divider-color); padding-top: 10px; min-width: 0; }
  `;
}
customElements.define('wattpilot-card-editor', WattpilotCardEditor);
