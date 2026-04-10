import { useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

// ── Raw data from parsed EPE bills ──────────────────────────────────────────
const RAW = [
  { bill_date:"2024-05-14", start:"04/11/2024", end:"05/14/2024", del:539, rcvd:487, net:52,   solar:924, home:976,  on_pk:null, off_pk:null, bill:13.35, summer:false },
  { bill_date:"2024-06-13", start:"05/14/2024", end:"06/13/2024", del:780, rcvd:345, net:435,  solar:858, home:1293, on_pk:null, off_pk:null, bill:49.02, summer:true  },
  { bill_date:"2024-07-15", start:"06/13/2024", end:"07/14/2024", del:428, rcvd:464, net:-36,  solar:819, home:783,  on_pk:null, off_pk:null, bill:3.12,  summer:false },
  { bill_date:"2024-08-13", start:"07/14/2024", end:"08/13/2024", del:830, rcvd:261, net:569,  solar:645, home:1214, on_pk:null, off_pk:570,  bill:70.47, summer:true  },
  { bill_date:"2024-09-13", start:"08/13/2024", end:"09/13/2024", del:1019,rcvd:151, net:868,  solar:517, home:1385, on_pk:134,  off_pk:734,  bill:105.90,summer:true  },
  { bill_date:"2024-10-14", start:"09/13/2024", end:"10/14/2024", del:973, rcvd:134, net:839,  solar:488, home:1327, on_pk:18,   off_pk:821,  bill:79.91, summer:true  },
  { bill_date:"2024-11-13", start:"10/14/2024", end:"11/13/2024", del:563, rcvd:149, net:414,  solar:360, home:774,  on_pk:null, off_pk:414,  bill:41.28, summer:false },
  { bill_date:"2024-12-12", start:"11/13/2024", end:"12/12/2024", del:574, rcvd:91,  net:483,  solar:274, home:757,  on_pk:null, off_pk:484,  bill:45.38, summer:false },
  { bill_date:"2025-01-14", start:"12/12/2024", end:"01/14/2025", del:417, rcvd:143, net:274,  solar:270, home:544,  on_pk:null, off_pk:273,  bill:31.61, summer:false },
  { bill_date:"2025-02-13", start:"01/14/2025", end:"02/13/2025", del:650, rcvd:113, net:537,  solar:345, home:882,  on_pk:null, off_pk:537,  bill:59.14, summer:false },
  { bill_date:"2025-03-13", start:"02/13/2025", end:"03/13/2025", del:468, rcvd:203, net:265,  solar:405, home:670,  on_pk:null, off_pk:265,  bill:37.76, summer:false },
  { bill_date:"2025-04-11", start:"03/13/2025", end:"04/11/2025", del:509, rcvd:235, net:274,  solar:479, home:753,  on_pk:null, off_pk:274,  bill:35.27, summer:false },
  { bill_date:"2025-05-13", start:"04/11/2025", end:"05/13/2025", del:575, rcvd:287, net:288,  solar:625, home:913,  on_pk:null, off_pk:289,  bill:36.30, summer:false },
  { bill_date:"2025-06-20", start:"05/13/2025", end:"06/12/2025", del:641, rcvd:280, net:361,  solar:628, home:989,  on_pk:null, off_pk:379,  bill:42.78, summer:false },
  { bill_date:"2025-07-14", start:"06/12/2025", end:"07/14/2025", del:777, rcvd:219, net:558,  solar:615, home:1173, on_pk:87,   off_pk:472,  bill:76.72, summer:true  },
  { bill_date:"2025-08-13", start:"07/14/2025", end:"08/13/2025", del:1364,rcvd:93,  net:1271, solar:539, home:1810, on_pk:155,  off_pk:1116, bill:149.58,summer:true  },
  { bill_date:"2025-09-12", start:"08/13/2025", end:"09/12/2025", del:1320,rcvd:72,  net:1248, solar:477, home:1725, on_pk:254,  off_pk:994,  bill:163.39,summer:true  },
  { bill_date:"2025-10-14", start:"09/12/2025", end:"10/14/2025", del:1061,rcvd:93,  net:968,  solar:446, home:1414, on_pk:61,   off_pk:907,  bill:106.59,summer:true  },
  { bill_date:"2025-11-12", start:"10/14/2025", end:"11/12/2025", del:535, rcvd:169, net:366,  solar:379, home:745,  on_pk:null, off_pk:367,  bill:31.41, summer:false },
  { bill_date:"2025-12-11", start:"11/12/2025", end:"12/11/2025", del:579, rcvd:87,  net:492,  solar:278, home:770,  on_pk:null, off_pk:492,  bill:34.34, summer:false },
  { bill_date:"2026-01-14", start:"12/11/2025", end:"01/14/2026", del:801, rcvd:67,  net:734,  solar:276, home:1010, on_pk:null, off_pk:734,  bill:53.32, summer:false },
  { bill_date:"2026-02-12", start:"01/14/2026", end:"02/12/2026", del:600, rcvd:113, net:487,  solar:312, home:799,  on_pk:null, off_pk:487,  bill:39.86, summer:false },
  { bill_date:"2026-03-16", start:"02/12/2026", end:"03/16/2026", del:537, rcvd:226, net:311,  solar:469, home:780,  on_pk:null, off_pk:311,  bill:32.28, summer:false },
];

// Parse billing month as the END date's month (what month the usage covers)
function billMonth(d) {
  // Use end date of billing period → that's the month the bill covers
  const [m, , y] = d.end.split('/');
  return { year: parseInt(y), month: parseInt(m) };
}

const MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Enrich records
const data = RAW.map(r => {
  const { year, month } = billMonth(r);
  const solar_home = r.solar != null ? r.solar - r.rcvd : null;  // solar used at home
  return { ...r, year, month, monthName: MONTH_NAMES[month], solar_home,
           label: `${MONTH_NAMES[month]} '${String(year).slice(2)}` };
});

const years = [...new Set(data.map(d => d.year))].sort();
const YEAR_COLORS = { 2024:"#94a3b8", 2025:"#3b82f6", 2026:"#f59e0b" };

// ── Totals for summary cards ──────────────────────────────────────────────
function yearTotals(yr) {
  const rows = data.filter(d => d.year === yr);
  return {
    totalBill: rows.reduce((s, r) => s + r.bill, 0),
    totalNet: rows.reduce((s, r) => s + r.net, 0),
    totalSolar: rows.reduce((s, r) => s + (r.solar || 0), 0),
    totalHome: rows.reduce((s, r) => s + (r.home || 0), 0),
    totalExport: rows.reduce((s, r) => s + r.rcvd, 0),
    months: rows.length,
  };
}

// ── Monthly comparison data (side-by-side by month) ───────────────────────
function buildMonthlyComparison() {
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const row = { month: m, name: MONTH_NAMES[m] };
    years.forEach(yr => {
      const rec = data.find(d => d.month === m && d.year === yr);
      if (rec) {
        row[`home_${yr}`] = rec.home;
        row[`solar_${yr}`] = rec.solar;
        row[`net_${yr}`] = rec.net;
        row[`bill_${yr}`] = rec.bill;
        row[`export_${yr}`] = rec.rcvd;
      }
    });
    months.push(row);
  }
  return months.filter(r => years.some(yr => r[`home_${yr}`] != null));
}

const monthlyComp = buildMonthlyComparison();

// ── Chronological series for "all bills" view ─────────────────────────────
const chronoData = data.map(r => ({
  label: r.label,
  bill_date: r.bill_date,
  net: r.net,
  solar: r.solar,
  home: r.home,
  export: r.rcvd,
  solar_home: r.solar_home,
  bill: r.bill,
  on_pk: r.on_pk,
  off_pk: r.off_pk,
  summer: r.summer,
}));

// ── Tooltip ───────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"white", border:"1px solid #e2e8f0", borderRadius:8,
                  padding:"10px 14px", fontSize:12, boxShadow:"0 4px 12px rgba(0,0,0,.08)" }}>
      <p style={{ fontWeight:700, color:"#0f172a", marginBottom:6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color, margin:"2px 0" }}>
          {p.name}: {typeof p.value === 'number' ? (p.name.includes('$') || p.name.toLowerCase().includes('bill') ? `$${p.value.toFixed(2)}` : `${p.value} kWh`) : p.value}
        </p>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [view, setView] = useState("monthly"); // "monthly" | "chrono" | "tou"
  const [metric, setMetric] = useState("home"); // "home" | "solar" | "net" | "bill" | "export"

  const metricOpts = [
    { key:"home",   label:"Home Consumption", unit:"kWh", color2024:"#94a3b8", color2025:"#3b82f6", color2026:"#f59e0b" },
    { key:"solar",  label:"Solar Generation", unit:"kWh", color2024:"#fca5a5", color2025:"#f97316", color2026:"#fbbf24" },
    { key:"net",    label:"Grid Net (DEL−RCVD)", unit:"kWh", color2024:"#cbd5e1", color2025:"#6366f1", color2026:"#a78bfa" },
    { key:"export", label:"Solar Export to Grid", unit:"kWh", color2024:"#bbf7d0", color2025:"#22c55e", color2026:"#84cc16" },
    { key:"bill",   label:"Bill Total", unit:"$", color2024:"#fde68a", color2025:"#f59e0b", color2026:"#ef4444" },
  ];
  const mo = metricOpts.find(m => m.key === metric);

  const btnStyle = (active) => ({
    padding:"6px 14px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
    background: active ? "#1e40af" : "#e2e8f0", color: active ? "white" : "#475569",
  });

  return (
    <div style={{ fontFamily:"'Inter',-apple-system,sans-serif", background:"#f8fafc", minHeight:"100vh", padding:24, maxWidth:960, margin:"0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom:20 }}>
        <h1 style={{ fontSize:22, fontWeight:800, color:"#0f172a", margin:0 }}>EPE Usage & Solar Dashboard</h1>
        <p style={{ color:"#64748b", fontSize:13, margin:"4px 0 0" }}>
          2333 Cheyenne Dr Las Cruces NM · 23 bills · May 2024 – Mar 2026 · Account 8611863488
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${years.length}, 1fr)`, gap:12, marginBottom:20 }}>
        {years.map(yr => {
          const t = yearTotals(yr);
          return (
            <div key={yr} style={{ background:"white", borderRadius:10, padding:16,
                                    borderTop:`4px solid ${YEAR_COLORS[yr]}`,
                                    boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
              <div style={{ fontSize:13, fontWeight:700, color:YEAR_COLORS[yr] }}>{yr} ({t.months} bills)</div>
              <div style={{ marginTop:8, fontSize:12, color:"#334155", lineHeight:1.8 }}>
                <div>🏠 Home: <b>{t.totalHome.toLocaleString()} kWh</b></div>
                <div>☀️ Solar: <b>{t.totalSolar.toLocaleString()} kWh</b></div>
                <div>🔌 Net grid: <b>{t.totalNet.toLocaleString()} kWh</b></div>
                <div>⬆️ Exported: <b>{t.totalExport.toLocaleString()} kWh</b></div>
                <div>💵 Bills: <b>${t.totalBill.toFixed(2)}</b></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View / Metric Controls */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"#64748b", fontWeight:600 }}>VIEW:</span>
        {[["monthly","By Month (YoY)"],["chrono","Chronological"],["tou","TOU On/Off-Peak"]].map(([k,l]) => (
          <button key={k} style={btnStyle(view===k)} onClick={() => setView(k)}>{l}</button>
        ))}
        {view === "monthly" && (
          <>
            <span style={{ fontSize:12, color:"#64748b", fontWeight:600, marginLeft:12 }}>METRIC:</span>
            {metricOpts.map(m => (
              <button key={m.key} style={btnStyle(metric===m.key)} onClick={() => setMetric(m.key)}>{m.label}</button>
            ))}
          </>
        )}
      </div>

      {/* ── Chart: Monthly YoY comparison ── */}
      {view === "monthly" && (
        <div style={{ background:"white", borderRadius:12, padding:"20px 16px 12px 8px",
                      boxShadow:"0 1px 3px rgba(0,0,0,.06)", marginBottom:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 16px 16px" }}>
            {mo.label} — Year-over-Year by Month
          </h3>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={monthlyComp} margin={{ top:10, right:20, left:10, bottom:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize:12, fill:"#64748b" }} />
              <YAxis tick={{ fontSize:12, fill:"#64748b" }}
                     tickFormatter={v => mo.unit==="$" ? `$${v}` : `${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              {metric === "net" && <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="4 2" />}
              {years.map(yr => (
                <Bar key={yr} dataKey={`${metric}_${yr}`} name={`${yr} ${mo.unit==="$"?"$":"kWh"}`}
                     fill={mo[`color${yr}`]} radius={[3,3,0,0]} maxBarSize={40} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
          {metric === "net" && (
            <p style={{ fontSize:11, color:"#94a3b8", margin:"8px 16px 0", fontStyle:"italic" }}>
              Negative NET = month where solar exceeded grid draw (pure solar surplus — Jul 2024: −36 kWh)
            </p>
          )}
        </div>
      )}

      {/* ── Chart: Chronological stacked ── */}
      {view === "chrono" && (
        <div style={{ background:"white", borderRadius:12, padding:"20px 16px 12px 8px",
                      boxShadow:"0 1px 3px rgba(0,0,0,.06)", marginBottom:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 16px 16px" }}>
            Home Consumption = Grid Net + Solar (Chronological)
          </h3>
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={chronoData} margin={{ top:10, right:20, left:10, bottom:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:"#64748b" }} angle={-35} textAnchor="end" height={55} />
              <YAxis yAxisId="kwh" tick={{ fontSize:12, fill:"#64748b" }} tickFormatter={v=>`${v}`}
                     label={{ value:"kWh", angle:-90, position:"insideLeft", fontSize:11, fill:"#94a3b8" }} />
              <YAxis yAxisId="bill" orientation="right" tick={{ fontSize:12, fill:"#64748b" }}
                     tickFormatter={v=>`$${v}`}
                     label={{ value:"Bill $", angle:90, position:"insideRight", fontSize:11, fill:"#94a3b8" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              {/* Stacked: solar used at home (yellow) + grid net (blue) = home consumption */}
              <Bar yAxisId="kwh" dataKey="solar_home" name="Solar (home use)" stackId="a"
                   fill="#fbbf24" radius={[0,0,0,0]} maxBarSize={35} />
              <Bar yAxisId="kwh" dataKey="net" name="Grid Net kWh" stackId="a"
                   fill="#3b82f6" radius={[3,3,0,0]} maxBarSize={35}>
                {chronoData.map((d, i) => (
                  <Cell key={i} fill={d.net < 0 ? "#22c55e" : "#3b82f6"} />
                ))}
              </Bar>
              <Line yAxisId="kwh" type="monotone" dataKey="solar" name="Solar Generated"
                    stroke="#f97316" strokeWidth={2} dot={{ r:3 }} strokeDasharray="5 3" />
              <Line yAxisId="bill" type="monotone" dataKey="bill" name="Bill $"
                    stroke="#dc2626" strokeWidth={2} dot={{ r:3 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <p style={{ fontSize:11, color:"#94a3b8", margin:"8px 16px 0", fontStyle:"italic" }}>
            Bars stacked: yellow = solar used at home, blue = net grid draw. Orange dashed = total solar generation. Red line = bill amount (right axis).
          </p>
        </div>
      )}

      {/* ── Chart: TOU On/Off Peak ── */}
      {view === "tou" && (
        <div style={{ background:"white", borderRadius:12, padding:"20px 16px 12px 8px",
                      boxShadow:"0 1px 3px rgba(0,0,0,.06)", marginBottom:20 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 4px 16px" }}>
            TOU On-Peak vs Off-Peak kWh (summer billing periods)
          </h3>
          <p style={{ fontSize:11, color:"#94a3b8", margin:"0 0 12px 16px" }}>
            On-peak rate: $0.221/kWh · Off-peak: $0.055/kWh · Summer = Jun–Oct billing periods
          </p>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={chronoData.filter(d => d.summer || d.off_pk != null)}
                           margin={{ top:10, right:20, left:10, bottom:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:"#64748b" }} angle={-35} textAnchor="end" height={55} />
              <YAxis tick={{ fontSize:12, fill:"#64748b" }}
                     label={{ value:"kWh", angle:-90, position:"insideLeft", fontSize:11, fill:"#94a3b8" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="on_pk" name="On-Peak kWh (@$0.221)" stackId="a"
                   fill="#dc2626" radius={[0,0,0,0]} maxBarSize={40} />
              <Bar dataKey="off_pk" name="Off-Peak kWh (@$0.055)" stackId="a"
                   fill="#6366f1" radius={[3,3,0,0]} maxBarSize={40} />
              <Line type="monotone" dataKey="bill" name="Bill $" stroke="#f97316" strokeWidth={2} dot={{ r:3 }} />
            </ComposedChart>
          </ResponsiveContainer>
          <p style={{ fontSize:11, color:"#94a3b8", margin:"8px 16px 0" }}>
            On-peak hours: 3–8 PM Mon–Fri (summer only). TOU rate plan active since mid-2024. Off-peak only shown in non-summer months.
          </p>
        </div>
      )}

      {/* Bill data table */}
      <div style={{ background:"white", borderRadius:12, padding:20, boxShadow:"0 1px 3px rgba(0,0,0,.06)" }}>
        <h3 style={{ fontSize:13, fontWeight:700, color:"#0f172a", margin:"0 0 12px" }}>All Bills</h3>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #e2e8f0" }}>
                {["Bill Date","Period","Grid DEL","Grid RCVD","Net","Solar Gen","Solar→Home","Home Total","On-Pk","Off-Pk","Bill $","S"].map(h => (
                  <th key={h} style={{ padding:"6px 8px", textAlign:"right", color:"#64748b", fontWeight:600, whiteSpace:"nowrap" }}
                      className={h==="Bill Date"||h==="Period"?"":""}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((r, i) => (
                <tr key={i} style={{ borderBottom:"1px solid #f1f5f9", background: r.summer ? "#fff7ed" : "white" }}>
                  <td style={{ padding:"5px 8px", fontWeight:600, color:"#1e293b", whiteSpace:"nowrap" }}>{r.bill_date}</td>
                  <td style={{ padding:"5px 8px", color:"#64748b", whiteSpace:"nowrap" }}>{r.start}–{r.end}</td>
                  <td style={{ padding:"5px 8px", textAlign:"right" }}>{r.del}</td>
                  <td style={{ padding:"5px 8px", textAlign:"right", color:"#22c55e" }}>{r.rcvd}</td>
                  <td style={{ padding:"5px 8px", textAlign:"right", color: r.net < 0 ? "#22c55e" : "#1e293b", fontWeight: r.net < 0 ? 700 : 400 }}>{r.net}</td>
                  <td style={{ padding:"5px 8px", textAlign:"right", color:"#f97316" }}>{r.solar ?? "–"}</td>
                  <td style={{ padding:"5px 8px", textAlign:"right", color:"#fbbf24" }}>{r.solar_home != null ? Math.round(r.solar_home) : "–"}</td>
                  <td style={{ padding:"5px 8px", textAlign:"right", fontWeight:600 }}>{r.home ?? "–"}</td>
                  <td style={{ padding:"5px 8px", textAlign:"right", color:"#dc2626" }}>{r.on_pk ?? "–"}</td>
                  <td style={{ padding:"5px 8px", textAlign:"right", color:"#6366f1" }}>{r.off_pk ?? "–"}</td>
                  <td style={{ padding:"5px 8px", textAlign:"right", fontWeight:600, color:"#0f172a" }}>${r.bill.toFixed(2)}</td>
                  <td style={{ padding:"5px 8px", textAlign:"center" }}>{r.summer ? "☀️" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize:10, color:"#94a3b8", marginTop:12, textAlign:"center" }}>
        Data source: El Paso Electric bills parsed from PDF · Solar meter I347016257 (generation) · Grid meter I346971117 (DEL/RCVD/NET)
      </p>
    </div>
  );
}
