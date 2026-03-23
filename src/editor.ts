import { LitElement, html, css, TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';

export class WattpilotCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @state() private _config?: any;

  public setConfig(config: any): void {
    this._config = config;
  }

  // Pobiera ID encji niezależnie czy to string czy obiekt
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

  // Uniwersalna zmiana wartości obsługująca transformację String <-> Object
  private _handleValueChanged(ev: CustomEvent, key: string, field: string = 'entity'): void {
    if (!this._config || !this.hass) return;
    const newValue = ev.detail.value;
    const newConfig = JSON.parse(JSON.stringify(this._config));

    if (field === 'entity') {
      if (!newValue) {
        delete newConfig[key];
      } else {
        // Jeśli już jest obiektem (bo ma atrybuty), aktualizujemy tylko entity
        if (typeof newConfig[key] === 'object' && !Array.isArray(newConfig[key])) {
          newConfig[key].entity = newValue;
        } else {
          newConfig[key] = newValue; // Zwykły string
        }
      }
    } else {
      // Obsługa pól dodatkowych (attribute, icon, unit itp.)
      if (!newConfig[key] || typeof newConfig[key] !== 'object') {
        const currentEntity = typeof newConfig[key] === 'string' ? newConfig[key] : '';
        newConfig[key] = { entity: currentEntity };
      }
      
      if (newValue === "" || newValue === undefined) {
        delete newConfig[key][field];
      } else {
        newConfig[key][field] = newValue;
      }

      // Konwersja powrotna do stringa, jeśli został tylko klucz 'entity' i nie ma reguł
      const hasOnlyEntity = Object.keys(newConfig[key]).length === 1 && newConfig[key].entity !== undefined;
      const isBaseEntity = key.startsWith('entity_') || key.startsWith('left') || key.startsWith('right');
      
      if (hasOnlyEntity && isBaseEntity) {
         newConfig[key] = newConfig[key].entity;
      }
    }

    this._config = newConfig;
    this._dispatch(newConfig);
  }

  private _toggleAttribute(key: string): void {
    const newConfig = JSON.parse(JSON.stringify(this._config));
    const currentVal = newConfig[key];

    if (typeof currentVal === 'object' && currentVal.attribute !== undefined) {
      // Usuń atrybut i jeśli to możliwe, przywróć do stringa
      delete currentVal.attribute;
      if (Object.keys(currentVal).length === 1 && currentVal.entity !== undefined) {
        newConfig[key] = currentVal.entity;
      }
    } else {
      // Dodaj atrybut - zamień na obiekt
      const entityId = typeof currentVal === 'string' ? currentVal : (currentVal?.entity || '');
      newConfig[key] = { entity: entityId, attribute: "" };
    }

    this._config = newConfig;
    this._dispatch(newConfig);
  }

  private _updateColorRules(slot: string, index: number, field: 'value' | 'color', value: any) {
    const newConfig = JSON.parse(JSON.stringify(this._config));
    if (!newConfig[slot]) newConfig[slot] = { entity: "" };
    if (!newConfig[slot].color_rules) newConfig[slot].color_rules = [];
    
    if (field === 'value') newConfig[slot].color_rules[index].value = parseFloat(value);
    else newConfig[slot].color_rules[index].color = value;

    this._config = newConfig;
    this._dispatch(newConfig);
  }

  private _addColorRule(slot: string) {
    const newConfig = JSON.parse(JSON.stringify(this._config));
    if (typeof newConfig[slot] !== 'object') newConfig[slot] = { entity: newConfig[slot] || "" };
    if (!newConfig[slot].color_rules) newConfig[slot].color_rules = [];
    newConfig[slot].color_rules.push({ value: 0, color: "#ffffff" });
    this._config = newConfig;
    this._dispatch(newConfig);
  }

  private _removeColorRule(slot: string, index: number) {
    const newConfig = JSON.parse(JSON.stringify(this._config));
    if (newConfig[slot] && newConfig[slot].color_rules) {
      newConfig[slot].color_rules.splice(index, 1);
      if (newConfig[slot].color_rules.length === 0) {
        delete newConfig[slot].color_rules;
        // Konwersja do stringa jeśli została sama encja
        if (Object.keys(newConfig[slot]).length === 1 && newConfig[slot].entity) {
          newConfig[slot] = newConfig[slot].entity;
        }
      }
    }
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
        <div class="selector-with-checkbox">
          <ha-selector
            .hass=${this.hass}
            .selector=${{ entity: {} }}
            .value=${entityId}
            .label=${label}
            @value-changed=${(ev: any) => this._handleValueChanged(ev, key, 'entity')}
          ></ha-selector>
          ${hasExtraAttributes ? html`
            <div class="checkbox-container" title="Use Attribute">
              <ha-checkbox .checked=${isObject && this._config[key].attribute !== undefined} @change=${() => this._toggleAttribute(key)}></ha-checkbox>
              <ha-icon icon="hass:file-tree"></ha-icon>
            </div>
          ` : ''}
        </div>
        ${isObject && this._config[key].attribute !== undefined ? html`
          <div class="attr-row">
            <ha-selector
              .hass=${this.hass}
              .selector=${{ attribute: { entity_id: entityId, hide_attributes: baseAttrs } }}
              .value=${this._getAttribute(key)}
              .label="Attribute for ${label}"
              @value-changed=${(ev: any) => this._handleValueChanged(ev, key, 'attribute')}
            ></ha-selector>
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderSideSlot(slot: string, label: string): TemplateResult {
    const entityId = this._getEntityId(slot);
    const colorRules = this._config[slot]?.color_rules || [];

    return html`
      <div class="side-entity-box">
        <div class="side-entity-header">${label}</div>
        ${this.renderEntityRow(slot, "Entity")}
        <div class="side-tools-grid">
          <ha-selector .hass=${this.hass} .selector=${{ icon: {} }} .value=${this._getOtherValue(slot, 'icon')} .label="Icon" @value-changed=${(ev: any) => this._handleValueChanged(ev, slot, 'icon')}></ha-selector>
          <ha-selector .hass=${this.hass} .selector=${{ text: {} }} .value=${this._getOtherValue(slot, 'unit')} .label="Unit (e.g. ' W')" @value-changed=${(ev: any) => this._handleValueChanged(ev, slot, 'unit')}></ha-selector>
        </div>
        
        <div class="rules-section">
          <div class="rules-header">
            <span>Color Rules</span>
            <ha-icon-button icon="hass:plus" @click=${() => this._addColorRule(slot)} title="Add Color Rule"></ha-icon-button>
          </div>
          ${colorRules.map((rule: any, idx: number) => html`
            <div class="rule-row">
              <ha-selector .hass=${this.hass} .selector=${{ number: { mode: "box", step: 0.1 } }} .value=${rule.value} label="Value" @value-changed=${(ev: any) => this._updateColorRules(slot, idx, 'value', ev.detail.value)}></ha-selector>
              <ha-selector .hass=${this.hass} .selector=${{ ui_color: {} }} .value=${rule.color} label="Color" @value-changed=${(ev: any) => this._updateColorRules(slot, idx, 'color', ev.detail.value)}></ha-selector>
              <ha-icon-button class="delete-btn" icon="hass:delete-outline" @click=${() => this._removeColorRule(slot, idx)} title="Remove Rule"></ha-icon-button>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  render(): TemplateResult {
    if (!this.hass || !this._config) return html``;
    
    // Pełna lista grup i encji zgodnie z plikiem YAML
    const groups = [
      {
        label: "Status & Core Entities",
        icon: "hass:information-outline",
        fields: [
          { key: "entity_status", label: "Car State" },
          { key: "entity_reason", label: "Charging Reason" },
          { key: "entity_charging", label: "Charging (Connected)" },
          { key: "entity_power", label: "Charging Power" },
          { key: "entity_energy", label: "Grid/Home Balance" },
          { key: "entity_session_energy", label: "Session Energy" },
          { key: "entity_total_charged", label: "Total Charged (kWh)" }
        ]
      },
      {
        label: "Main Controls",
        icon: "hass:tune",
        fields: [
          { key: "entity_current", label: "Charging Current" },
          { key: "entity_mode", label: "Charging Mode" },
          { key: "entity_phase", label: "Phase Switch" },
          { key: "entity_charge_pause", label: "Charge Pause" },
          { key: "entity_start", label: "Start Button" },
          { key: "entity_stop", label: "Stop Button" },
          { key: "entity_force", label: "Force Start Button" }
        ]
      },
      {
        label: "Vehicle & Battery",
        icon: "hass:car-electric",
        fields: [
          { key: "entity_soc", label: "Current SoC" },
          { key: "entity_soc_max", label: "Maximum SoC" },
          { key: "entity_target_soc", label: "Target SoC" },
          { key: "entity_min_soc", label: "Minimum SoC" },
          { key: "entity_range", label: "Range (km)" },
          { key: "entity_max_range", label: "Max Range (km)" },
          { key: "entity_charge_end", label: "Charging Time Left" }
        ]
      },
      {
        label: "Smart Features",
        icon: "hass:solar-power",
        fields: [
          { key: "entity_next_trip_pwr", label: "Next Trip Energy" },
          { key: "entity_next_trip_timing", label: "Next Trip Time" },
          { key: "entity_pv_surplus", label: "PV Surplus Switch" },
          { key: "entity_pv_threshold", label: "PV Battery Threshold" },
          { key: "entity_max_price", label: "Max Price" },
          { key: "entity_awattar", label: "Awattar/Lumina Switch" },
          { key: "entity_eco_persist", label: "Remain in Eco Mode" },
          { key: "entity_start_at", label: "Start Charging At" }
        ]
      },
      {
        label: "Boost & Phase Settings",
        icon: "hass:lightning-bolt-outline",
        fields: [
          { key: "entity_boost", label: "Boost Switch" },
          { key: "entity_boost_type", label: "Boost Type" },
          { key: "entity_boost_limit", label: "Boost Limit" },
          { key: "entity_phase_power", label: "3-Phase Power Level" },
          { key: "entity_phase_delay", label: "Phase Switch Delay" },
          { key: "entity_phase_interval", label: "Phase Switch Interval" }
        ]
      },
      {
        label: "Technical Settings",
        icon: "hass:cog",
        fields: [
          { key: "entity_lock", label: "Lock Level" },
          { key: "entity_cable_unlock", label: "Cable Unlock" },
          { key: "entity_sim_unplug", label: "Simulate Unplugging" },
          { key: "entity_power_outage", label: "Unlock on Power Outage" },
          { key: "entity_ground_check", label: "Ground Check" },
          { key: "entity_led_save", label: "LED Energy Saving" },
          { key: "entity_min_time", label: "Min Charging Time" },
          { key: "entity_restart", label: "Restart Button" }
        ]
      },
      {
        label: "System & Network",
        icon: "hass:wifi",
        fields: [
          { key: "entity_internal_error", label: "Internal Error Sensor" },
          { key: "entity_firmware_update", label: "Firmware Update" },
          { key: "entity_wifi_state", label: "WiFi State" },
          { key: "entity_wifi_conn", label: "WiFi Connection" },
          { key: "entity_wifi_signal", label: "WiFi Signal" },
          { key: "entity_hotspot_sw", label: "Disable Hotspot Switch" }
        ]
      }
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
            <ha-expansion-panel outlined>
              <div slot="header" class="header-content">
                <ha-icon icon="hass:arrow-left-bold-outline" class="header-icon-sub"></ha-icon>
                <span>Left Side Column</span>
              </div>
              <div class="fields-container">
                ${[1, 2, 3, 4, 5].map(i => this.renderSideSlot(`left${i}`, `Slot L${i}`))}
              </div>
            </ha-expansion-panel>

            <ha-expansion-panel outlined>
              <div slot="header" class="header-content">
                <ha-icon icon="hass:arrow-right-bold-outline" class="header-icon-sub"></ha-icon>
                <span>Right Side Column</span>
              </div>
              <div class="fields-container">
                ${[1, 2, 3, 4, 5].map(i => this.renderSideSlot(`right${i}`, `Slot R${i}`))}
              </div>
            </ha-expansion-panel>
          </div>
        </ha-expansion-panel>
      </div>
    `;
  }

  static styles = css`
    .card-config { display: flex; flex-direction: column; gap: 8px; padding: 12px 0; }
    ha-expansion-panel { border-radius: 8px; --ha-card-border-radius: 8px; margin-bottom: 4px; }
    
    .header-content { display: flex; align-items: center; gap: 12px; font-weight: 500; }
    .header-icon { color: var(--primary-color); }
    .header-icon-sub { color: var(--secondary-text-color); --mdc-icon-size: 20px; }
    
    .fields-container { display: flex; flex-direction: column; gap: 12px; padding: 16px; background: var(--card-background-color); }
    .fields-container-nested { display: flex; flex-direction: column; gap: 8px; padding: 8px; background: var(--secondary-background-color); }
    
    .field-row { display: flex; flex-direction: column; gap: 4px; }
    .selector-with-checkbox { display: flex; align-items: center; gap: 8px; }
    .selector-with-checkbox ha-selector { flex-grow: 1; }
    
    .checkbox-container { display: flex; flex-direction: column; align-items: center; min-width: 40px; }
    .checkbox-container ha-icon { --mdc-icon-size: 14px; color: var(--secondary-text-color); margin-top: -4px; }
    
    .attr-row { padding-left: 16px; border-left: 2px solid var(--primary-color); margin-top: 4px; }
    
    .side-entity-box { border-bottom: 1px solid var(--divider-color); padding-bottom: 12px; margin-bottom: 8px; }
    .side-entity-box:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .side-entity-header { font-size: 0.75rem; font-weight: bold; color: var(--primary-color); text-transform: uppercase; margin-bottom: 8px; }
    
    .side-tools-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
    
    .rules-section { margin-top: 12px; background: var(--card-background-color); padding: 8px 12px; border-radius: 8px; border: 1px dashed var(--divider-color); }
    .rules-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; font-weight: 500; color: var(--secondary-text-color); }
    .rules-header ha-icon-button { color: var(--primary-color); }
    
    .rule-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; margin-top: 8px; align-items: center; }
    .delete-btn { color: var(--error-color); }

    ha-selector { width: 100%; display: block; }
  `;
}
customElements.define('wattpilot-card-editor', WattpilotCardEditor);
