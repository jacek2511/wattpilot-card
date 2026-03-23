import { css } from 'lit';

export const cardStyles = css`
  :host {
    display: block;
  }

  .card-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px 0 16px; margin-bottom: 10px; }
  .reason-badge { padding: 4px 12px; border: 1.5px solid rgba(150, 150, 150, 0.3); border-radius: 18px; font-size: 11px; font-weight: 400; color: var(--secondary-text-color, #a1a1aa); text-align: center; min-height: 18px; display: flex; align-items: center; margin-top: -5px; }
  .status-badge { padding: 4px 12px; border: 1.5px solid var(--primary-color); border-radius: 18px; font-size: 11px; text-transform: uppercase; font-weight: bold; color: var(--primary-color); margin-top: -5px; transition: border-color 0.3s, color 0.3s; }
  .card-content { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  
  /* MENU/SUBMENU */
  .section-header { display: flex; justify-content: space-between; align-items: center; margin: 10px 0 8px 0; }
  .header-actions { display: flex; gap: 8px; }
  .sub-menu-trigger { cursor: pointer; --mdc-icon-size: 18px; color: var(--secondary-text-color); transition: all 0.3s ease; padding: 4px; border-radius: 50%; }
  .sub-menu-trigger:hover { color: var(--primary-color); background: rgba(var(--rgb-primary-color), 0.1); }
  .sub-menu-trigger.active { color: var(--primary-color); background: rgba(var(--rgb-primary-color), 0.15); transform: scale(1.1); }
  .sub-panel { background: rgba(150, 150, 150, 0.05); border-radius: 12px; padding: 12px; margin-bottom: 10px; border: 1px solid rgba(150, 150, 150, 0.1); animation: slideDown 0.3s ease-out; }
  .val-txt { font-size: 12px; font-weight: 500; color: var(--primary-text-color); text-align: right; flex: 0 0 130px; margin-left: auto; }
  .hidden { display: none !important; }
  
  /* Styl dla list rozwijanych i pól wyboru */
  select, option { background-color: var(--card-background-color, #fff); color: var(--primary-text-color, #212121); }
  
  /* PRZYCISKI TRYBÓW */
  .mode-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 0 16px; height: 60px; margin-bottom: 10px; }
  .mode-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 14px; background: var(--secondary-background-color, #f3f4f6); cursor: pointer; transition: 0.2s; border: 2px solid transparent; }
  .mode-btn[data-val="Default"] { color: #f97316; }
  .mode-btn[data-val="Eco"] { color: #22c55e; }
  .mode-btn[data-val="Next Trip"] { color: var(--primary-text-color); }
  .mode-btn ha-icon { margin-bottom: 4px; }
  .mode-btn span { font-size: 12px; }
  .mode-btn.active { background: rgba(0, 123, 255, 0.1); border-color: #007bff; }
  
  /* PRZYCISKI AKCJI */
  .action-stack { display: flex; flex-direction: column; gap: 4px; height: 100%; }
  .action-btn { flex: 1; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; font-size: 10px; cursor: pointer; color: white; transition: opacity 0.2s; }
  .action-btn.start { background: #22c55e; }
  .action-btn.force { background: #f59e0b; }
  .action-btn.stop { background: #ef4444; }
  
  /* WIZUALIZACJA GÓRNA */
  .top-visuals { position: relative; width: 100%; min-height: 125px; display: flex; justify-content: space-between; align-items: center; margin-top: 5px; padding: 0 10px; box-sizing: border-box; }
  .side-column { display: flex; flex-direction: column; gap: 6px; width: 38%; z-index: 2; transform: translateY(-15px); }
  .side-column.left { align-items: flex-start; }
  .side-column.right { align-items: flex-end; }
  .data-row { display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 400; min-height: 18px; } 
  .data-row ha-icon { width: 14px; height: 14px; color: var(--primary-color); flex-shrink: 0; }
  .data-row span { transform: translateY(6px); } 
  .right .data-row { flex-direction: row-reverse; text-align: right; }
  
  /* WTYCZKA / KÓŁKO LED */
  .led-wrapper { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 100px; height: 100px; z-index: 1; margin-top: 20px; }
  #led-ring { position: absolute; width: 100%; height: 100%; z-index: 3; pointer-events: none; margin-left: -2px; margin-top: 0px; }
  .device-img { position: absolute; left: 50%; top: 20%; transform: translate(-50%, -50%); width: 78px; z-index: 1; }
  
  /* STATYSTYKI BATERII I ZASIĘGU */
  .ev-stats { width: 100%; display: flex; flex-direction: column; gap: 6px; margin-top: -15px;}
  .top-line { display: flex; justify-content: space-between; font-size: 14px; }
  .soc-box, .range-box { display: flex; align-items: center; }
  .soc-box span, .range-box span { margin-left: 10px; }
  
  .progress-bar { width: 100%; height: 6px; background: rgba(150, 150, 150, 0.2); border-radius: 4px; overflow: hidden; }
  #soc-bar { height: 100%; width: 0%; transition: width 0.5s ease-out, background 0.3s ease; border-radius: 4px; background: linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%); background-size: 100% 100%; }
  #soc-bar.charging-anim { animation: slide 1s linear infinite; }
  
  /* CZAS ŁADOWANIA POD PASKIEM */
  .charging-time { text-align: center; font-size: 11px; font-weight: bold; color: var(--secondary-text-color); margin-top: -2px; min-height: 14px; }
  
  .power-box { margin: -15px 0 10px 0; display: flex; align-items: baseline; }
  #power { font-size: 24px; font-weight: bold; }
  #power-details { font-size: 16px; opacity: 0.7; margin-left: 15px; }
  
  /* KONTROLKI DOLNE I SLIDERY */
  .control-row { display: flex; align-items: center; height: 32px; width: 100%; box-sizing: border-box; position: relative; }
  .control-label { flex: 0 0 130px; font-size: 13px; color: var(--primary-text-color); white-space: nowrap; }
  .right-controls { display: flex; align-items: center; flex: 1; justify-content: flex-end; min-width: 0; }
  .right-controls input[type="range"] { position: absolute; left: 130px; right: 40px; margin: 0; padding: 0; }
  .native-select { background: rgba(150, 150, 150, 0.1); border: 1px solid rgba(150, 150, 150, 0.2); color: var(--primary-text-color); border-radius: 4px; padding: 4px; font-size: 12px; outline: none; cursor: pointer; max-width: 120px; }
  .input-with-unit-wrapper, select, ha-switch { display: flex; align-items: center; justify-content: flex-end; flex: 0 0 60px; margin-left: auto; }
  .input-with-unit-wrapper { display: flex; flex: 0 0 80px; align-items: center; justify-content: flex-end; border: 1px solid rgba(150, 150, 150, 0.2); border-radius: 4px; background: rgba(255, 255, 255, 0.05); padding: 0 6px; height: 28px; }
  .input-with-unit-wrapper input.num-input { width: 100% !important; border: none !important; background: transparent !important; text-align: right; color: var(--primary-text-color); outline: none !important; font-size: 13px; }
  .input-with-unit-wrapper input[type="time"] { width: 100%; background: transparent; color: var(--primary-text-color); border: none; font-family: inherit; font-size: 14px; }
  .input-with-unit-wrapper:focus-within { border-color: var(--primary-color); }
  .inner-unit { font-size: 12px; color: var(--secondary-text-color); user-select: none; pointer-events: none; } 
  input[type=range] { flex: 1; min-width: 50px; appearance: none; height: 6px; border-radius: 3px; background: rgba(150, 150, 150, 0.2); outline: none; margin: 0; }
  input[type=range]::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--primary-color); cursor: pointer; }
  input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
  
  .num-input { width: 70px; background: rgba(150, 150, 150, 0.1); border: 1px solid rgba(150, 150, 150, 0.2); color: var(--primary-text-color); border-radius: 4px; padding: 4px 6px; font-size: 12px; text-align: right; outline: none; transition: border-color 0.2s; }
  .num-input:focus { border-color: var(--primary-color); }
  
  #slider-current { background: linear-gradient(to right, #fff 0%, #fff var(--v, 0%), #444 var(--v, 0%), #444 100%); }
  #slider-current::-webkit-slider-thumb { background: #ffffff; box-shadow: 0 0 4px rgba(0,0,0,0.5); }
  
  .divider { height: 1px; background: rgba(150, 150, 150, 0.2); margin: 8px 0 6px 0; }
  .section-title { font-size: 11px; font-weight: bold; color: var(--secondary-text-color); margin-bottom: 8px; letter-spacing: 0.5px; }
  
  /* PRZYCISKI FAZ */
  .phase-btns { display: flex; gap: 8px; justify-content: flex-end; }
  .phase-btn { padding: 4px 12px; font-size: 12px; font-weight: 500; cursor: pointer; border-radius: 16px; background: rgba(150, 150, 150, 0.1); transition: background 0.2s, color 0.2s; border: 1px solid transparent; }
  .phase-btn.active { background: var(--primary-color); color: white; }
  
  /* LEDS */
  .led { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.15); top: 50%; left: 50%; transition: opacity 0.1s linear, background 0.1s linear; }
  .blue { background: #007bff; box-shadow: 0 0 5px #007bff; }
  .blue-blink { background: #007bff; animation: blink 1s infinite; }
  .led.blue.fading { box-shadow: none !important; }
  .led.blue.breathing { animation: breath 2s ease-in-out infinite; }
  .green { background: #22c55e; }
  .yellow { background: #ffc107; }
  .white { background: #ffffff; animation: none !important; opacity: 1 !important;}
  
  @keyframes blink { 50% { opacity: 0.1; } }
  @keyframes breath { 0%, 100% { opacity: 1; } 50% { opacity: 0.1; } }
  @keyframes slide { from { background-position: 0 0, 0 0; } to { background-position: 30px 0, 0 0; } }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
`;
