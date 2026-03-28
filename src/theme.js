export const GLOBAL_CSS = `
  :root {
    --gold:     #c4a060;
    --gold-dim: rgba(196,160,96,.18);
    --gold-glow:rgba(196,160,96,.08);
    --copper:   #a06840;
    --bg:       #060402;
    --bg1:      #0c0906;
    --bg2:      #111008;
    --border:   rgba(196,160,96,.12);
    --text:     #e8dcc8;
    --text-dim: #7a6a50;
    --text-off: #3a2e1e;
    --green:    #4a9060;
    --red:      #903030;
  }

  @keyframes fadeIn  { from{opacity:0}               to{opacity:1} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pulse   { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes spin    { to{transform:rotate(360deg)} }

  .fade-in  { animation: fadeIn  .35s ease both; }
  .fade-up  { animation: fadeUp  .4s  ease both; }
  .fade-up2 { animation: fadeUp  .4s  .08s ease both; opacity:0; animation-fill-mode:forwards; }
  .fade-up3 { animation: fadeUp  .4s  .16s ease both; opacity:0; animation-fill-mode:forwards; }
  .fade-up4 { animation: fadeUp  .4s  .24s ease both; opacity:0; animation-fill-mode:forwards; }
`
