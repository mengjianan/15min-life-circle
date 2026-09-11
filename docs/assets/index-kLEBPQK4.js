const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/MapView-em-JbOlM.js","assets/react-vendor-nf7bT_Uh.js","assets/Report-CP7DOETS.js","assets/RadarChart-udyoXBuV.js","assets/echarts-vendor-BBmD_jO2.js","assets/TimeComparison-2PIeyCUG.js","assets/AreaComparison-B3qbn34l.js","assets/FacilityAccessibility-BBAFRi5d.js","assets/CustomCenter-DB8NZtYp.js","assets/CommunityComparison-CtT9IONG.js"])))=>i.map(i=>d[i]);
import{r as o,a as W,R as Y}from"./react-vendor-nf7bT_Uh.js";(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))a(t);new MutationObserver(t=>{for(const i of t)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function p(t){const i={};return t.integrity&&(i.integrity=t.integrity),t.referrerPolicy&&(i.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?i.credentials="include":t.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function a(t){if(t.ep)return;t.ep=!0;const i=p(t);fetch(t.href,i)}})();var D={exports:{}},C={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var K=o,X=Symbol.for("react.element"),G=Symbol.for("react.fragment"),Q=Object.prototype.hasOwnProperty,Z=K.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,ee={key:!0,ref:!0,__self:!0,__source:!0};function M(c,n,p){var a,t={},i=null,r=null;p!==void 0&&(i=""+p),n.key!==void 0&&(i=""+n.key),n.ref!==void 0&&(r=n.ref);for(a in n)Q.call(n,a)&&!ee.hasOwnProperty(a)&&(t[a]=n[a]);if(c&&c.defaultProps)for(a in n=c.defaultProps,n)t[a]===void 0&&(t[a]=n[a]);return{$$typeof:X,type:c,key:i,ref:r,props:t,_owner:Z.current}}C.Fragment=G;C.jsx=M;C.jsxs=M;D.exports=C;var e=D.exports,T={},I=W;T.createRoot=I.createRoot,T.hydrateRoot=I.hydrateRoot;const te="modulepreload",se=function(c){return"/15min-life-circle/"+c},A={},y=function(n,p,a){let t=Promise.resolve();if(p&&p.length>0){document.getElementsByTagName("link");const r=document.querySelector("meta[property=csp-nonce]"),h=(r==null?void 0:r.nonce)||(r==null?void 0:r.getAttribute("nonce"));t=Promise.allSettled(p.map(u=>{if(u=se(u),u in A)return;A[u]=!0;const f=u.endsWith(".css"),d=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${u}"]${d}`))return;const m=document.createElement("link");if(m.rel=f?"stylesheet":te,f||(m.as="script"),m.crossOrigin="",m.href=u,h&&m.setAttribute("nonce",h),document.head.appendChild(m),f)return new Promise((g,x)=>{m.addEventListener("load",g),m.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${u}`)))})}))}function i(r){const h=new Event("vite:preloadError",{cancelable:!0});if(h.payload=r,window.dispatchEvent(h),!h.defaultPrevented)throw r}return t.then(r=>{for(const h of r||[])h.status==="rejected"&&i(h.reason);return n().catch(i)})},N=[{lng:118.7784,lat:32.0663,name:"鼓楼区湖南路街道"},{lng:118.7854,lat:32.0553,name:"鼓楼区中央门街道"},{lng:118.8034,lat:32.0683,name:"玄武区新街口街道"},{lng:118.7894,lat:32.0433,name:"秦淮区夫子庙街道"}];function re(c,n){const{community_name:p,score:a,suggestions:t,blind_spots:i}=c,r=Object.entries(a.categories).map(([d,m])=>{const g=m,x=g>=80?"#52c41a":g>=60?"#1890ff":"#faad14";return`
        <div class="category-item">
          <span class="category-name">${d}</span>
          <div class="category-bar-container">
            <div class="category-bar" style="width: ${g}%; background-color: ${x}"></div>
          </div>
          <span class="category-score">${g}分</span>
        </div>
      `}).join(""),h=t.map(d=>`
      <div class="suggestion-item ${d.priority==="高"?"high-priority":""}">
        <span class="suggestion-priority">[${d.priority}]</span>
        <span class="suggestion-category">${d.category}</span>
        <span class="suggestion-message">${d.message}</span>
      </div>
    `).join(""),u=i.length>0?i.map(d=>`
          <div class="blind-spot-item">
            <span class="spot-icon">⚠️</span>
            <span class="spot-category">${d.category}:</span>
            <span class="spot-description">${d.description}</span>
          </div>
        `).join(""):'<p class="no-spots">✅ 未发现明显服务盲区</p>';let f="";return n&&n.layers&&(f=`
      <div class="section">
        <h2>⏱️ 多时间维度分析</h2>
        <div class="time-layers">${n.layers.map(m=>`
        <div class="time-layer-item">
          <span class="layer-time">${m.time_text}</span>
          <span class="layer-area">${(m.area/1e6).toFixed(2)} km²</span>
        </div>
      `).join("")}</div>
      </div>
    `),`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p} - 15分钟生活圈体检报告</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Microsoft YaHei', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }

    .report-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .report-header {
      background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .report-header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }

    .report-header p {
      opacity: 0.9;
      font-size: 14px;
    }

    .score-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      padding: 30px;
      background: #fafafa;
      border-bottom: 1px solid #e8e8e8;
    }

    .score-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1890ff, #722ed1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .score-number {
      font-size: 48px;
      font-weight: bold;
      line-height: 1;
    }

    .score-label {
      font-size: 14px;
      opacity: 0.9;
    }

    .score-info {
      text-align: left;
    }

    .score-level {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    .score-detail {
      font-size: 14px;
      color: #666;
    }

    .section {
      padding: 20px 30px;
      border-bottom: 1px solid #f0f0f0;
    }

    .section:last-child {
      border-bottom: none;
    }

    .section h2 {
      font-size: 18px;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1890ff;
    }

    .category-item {
      display: flex;
      align-items: center;
      margin: 12px 0;
      padding: 8px 0;
    }

    .category-name {
      width: 80px;
      font-weight: 500;
      color: #666;
    }

    .category-bar-container {
      flex: 1;
      height: 20px;
      background: #e8e8e8;
      border-radius: 10px;
      overflow: hidden;
      margin: 0 15px;
    }

    .category-bar {
      height: 100%;
      border-radius: 10px;
      transition: width 0.3s ease;
    }

    .category-score {
      width: 60px;
      text-align: right;
      font-weight: 600;
      color: #333;
    }

    .suggestion-item {
      padding: 12px 16px;
      margin: 8px 0;
      background: #f6ffed;
      border-left: 4px solid #52c41a;
      border-radius: 0 4px 4px 0;
      display: flex;
      align-items: baseline;
      gap: 10px;
    }

    .suggestion-item.high-priority {
      background: #fff1f0;
      border-left-color: #ff4d4f;
    }

    .suggestion-priority {
      font-weight: 600;
      color: #666;
      white-space: nowrap;
    }

    .suggestion-category {
      font-weight: 500;
      color: #333;
      white-space: nowrap;
    }

    .suggestion-message {
      color: #666;
    }

    .blind-spot-item {
      padding: 12px 16px;
      margin: 8px 0;
      background: #fff7e6;
      border-left: 4px solid #faad14;
      border-radius: 0 4px 4px 0;
    }

    .spot-icon {
      margin-right: 8px;
    }

    .spot-category {
      font-weight: 600;
      color: #333;
      margin-right: 8px;
    }

    .spot-description {
      color: #666;
    }

    .no-spots {
      color: #52c41a;
      font-weight: 500;
    }

    .time-layers {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .time-layer-item {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }

    .layer-time {
      display: block;
      font-weight: 600;
      color: #1890ff;
      margin-bottom: 8px;
    }

    .layer-area {
      display: block;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .report-footer {
      padding: 20px 30px;
      background: #fafafa;
      text-align: center;
      color: #999;
      font-size: 12px;
    }

    @media print {
      body {
        padding: 0;
        background: white;
      }

      .report-container {
        box-shadow: none;
        border-radius: 0;
      }
    }
  </style>
</head>
<body>
  <div class="report-container">
    <div class="report-header">
      <h1>🏘️ 15分钟生活圈体检报告</h1>
      <p>${p}</p>
    </div>

    <div class="score-section">
      <div class="score-circle">
        <span class="score-number">${a.total}</span>
        <span class="score-label">综合评分</span>
      </div>
      <div class="score-info">
        <div class="score-level">评级: ${a.level}</div>
        <div class="score-detail">盲区扣分: -${a.blind_spot_penalty}分</div>
        <div class="score-detail">分析时间: ${new Date().toLocaleString("zh-CN")}</div>
      </div>
    </div>

    <div class="section">
      <h2>📊 各类设施评分</h2>
      ${r}
    </div>

    ${f}

    <div class="section">
      <h2>💡 改善建议</h2>
      ${h}
    </div>

    <div class="section">
      <h2>⚠️ 服务盲区</h2>
      ${u}
    </div>

    <div class="report-footer">
      <p>15分钟生活圈智能体检与规划助手 - 基于百度地图开放能力</p>
      <p>报告生成时间: ${new Date().toLocaleString("zh-CN")}</p>
    </div>
  </div>
</body>
</html>
  `}function oe(c,n){const p=re(c,n),a=window.open("","_blank");if(!a){alert("请允许弹出窗口以导出报告");return}a.document.write(p),a.document.close(),a.onload=()=>{a.print()}}const ne=o.lazy(()=>y(()=>import("./MapView-em-JbOlM.js"),__vite__mapDeps([0,1]))),ae=o.lazy(()=>y(()=>import("./Report-CP7DOETS.js"),__vite__mapDeps([2,1]))),ie=o.lazy(()=>y(()=>import("./RadarChart-udyoXBuV.js"),__vite__mapDeps([3,1,4]))),ce=o.lazy(()=>y(()=>import("./TimeComparison-2PIeyCUG.js"),__vite__mapDeps([5,1]))),le=o.lazy(()=>y(()=>import("./AreaComparison-B3qbn34l.js"),__vite__mapDeps([6,1,4]))),de=o.lazy(()=>y(()=>import("./FacilityAccessibility-BBAFRi5d.js"),__vite__mapDeps([7,1]))),pe=o.lazy(()=>y(()=>import("./CustomCenter-DB8NZtYp.js"),__vite__mapDeps([8,1]))),me=o.lazy(()=>y(()=>import("./CommunityComparison-CtT9IONG.js"),__vite__mapDeps([9,1,4]))),w=()=>e.jsxs("div",{className:"component-loading",children:[e.jsx("div",{className:"loading-spinner"}),e.jsx("span",{children:"加载中..."})]}),he=({progress:c,loading:n})=>n?e.jsxs("div",{className:"progress-container",children:[e.jsx("div",{className:"progress-bar",children:e.jsx("div",{className:"progress-fill",style:{width:`${c}%`}})}),e.jsxs("div",{className:"progress-text",children:[e.jsx("span",{className:"progress-icon",children:"⏳"}),e.jsxs("span",{children:["分析中... ",c,"%"]})]})]}):null;function ue(){const[c,n]=o.useState(null),[p,a]=o.useState(null),[t,i]=o.useState(null),[r,h]=o.useState(null),[u,f]=o.useState(15),[d,m]=o.useState(!1),[g,x]=o.useState(0),[$,S]=o.useState(null),[L,R]=o.useState(0),[j,F]=o.useState([]),[E,H]=o.useState(!1);o.useEffect(()=>{N.length>0&&n(N[0])},[]),o.useEffect(()=>{let s;return d?(x(0),s=setInterval(()=>{x(l=>l>=90?(clearInterval(s),90):l+Math.random()*15)},500)):x(0),()=>{s&&clearInterval(s)}},[d]);const k=o.useCallback(()=>p||c,[p,c]),P=o.useCallback(async()=>{const s=k();if(s){m(!0),S(null),R(0);try{const[l,_]=await Promise.all([fetch("/api/analysis/report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:s.lng,lat:s.lat,community_name:s.name})}),fetch("/api/isochrone/multi-time",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:s.lng,lat:s.lat,directions:36})})]);if(!l.ok){const b=await l.json().catch(()=>({}));throw new Error(b.detail||"分析请求失败")}const z=await l.json();if(x(100),i(z),_.ok){const b=await _.json();h(b)}F(b=>[z,...b.slice(0,4)])}catch(l){S(l instanceof Error?l.message:"分析过程中出现错误")}finally{setTimeout(()=>m(!1),500)}}},[k]),V=o.useCallback(()=>{S(null),R(s=>s+1),P()},[P]),U=o.useCallback(s=>{f(s)},[]),O=o.useCallback((s,l)=>{a({lng:s,lat:l,name:"自定义位置"}),n(null)},[]),B=o.useCallback(()=>r&&r.layers&&r.layers.find(l=>l.time===u*60)||(t==null?void 0:t.isochrone),[r,u,t]),q=o.useCallback(()=>{t&&oe(t,r)},[t,r]),v=k(),J=j.map(s=>{var l;return{name:s.community_name,score:s.score.total,level:s.score.level,categories:s.score.categories,area:((l=s.isochrone)==null?void 0:l.area)||0}});return e.jsxs("div",{className:"app-container",children:[e.jsx("header",{className:"app-header",children:e.jsxs("div",{className:"header-content",children:[e.jsx("h1",{children:"🏘️ 15分钟生活圈智能体检与规划助手"}),e.jsx("p",{children:"基于百度地图开放能力，分析社区民生设施覆盖情况"})]})}),e.jsxs("main",{className:"app-main",children:[e.jsxs("div",{className:"controls-panel",children:[e.jsxs("div",{className:"control-group",children:[e.jsx("label",{children:"选择社区："}),e.jsxs("select",{value:(c==null?void 0:c.name)||"",onChange:s=>{const l=N.find(_=>_.name===s.target.value);n(l||null),a(null)},children:[e.jsx("option",{value:"",children:"自定义位置"}),N.map(s=>e.jsx("option",{value:s.name,children:s.name},s.name))]})]}),e.jsx("div",{className:"control-group",children:e.jsxs("button",{className:"toggle-custom-button",onClick:()=>H(!E),children:["📍 ",E?"隐藏":"显示","自定义位置"]})}),e.jsxs("div",{className:"control-group",children:[e.jsx("button",{className:"analyze-button",onClick:P,disabled:d||!v,children:d?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"button-spinner"}),"分析中..."]}):"🔍 开始体检"}),t&&e.jsx("button",{className:"export-button",onClick:q,children:"📥 导出报告"})]}),e.jsx(he,{progress:g,loading:d}),$&&e.jsxs("div",{className:"error-message",children:[e.jsxs("div",{className:"error-content",children:[e.jsx("span",{className:"error-icon",children:"❌"}),e.jsx("span",{className:"error-text",children:$})]}),e.jsxs("button",{className:"retry-button",onClick:V,children:["🔄 重试 ",L>0&&`(${L})`]})]})]}),e.jsxs("div",{className:"content-area",children:[e.jsxs("div",{className:"map-section",children:[e.jsx(o.Suspense,{fallback:e.jsx(w,{}),children:E&&e.jsx(pe,{onCenterSelect:O,currentCenter:v})}),e.jsx(o.Suspense,{fallback:e.jsx(w,{}),children:e.jsx(ne,{onCenterChange:O,center:v,isochrone:B(),poiCoverage:t==null?void 0:t.poi_coverage,blindSpots:t==null?void 0:t.blind_spots,loading:d})})]}),e.jsx("div",{className:"report-section",children:t?e.jsxs(o.Suspense,{fallback:e.jsx(w,{}),children:[r&&e.jsx(ce,{data:{time5:r.layers.find(s=>s.time===300),time10:r.layers.find(s=>s.time===600),time15:r.layers.find(s=>s.time===900)},onTimeChange:U}),r&&e.jsx(le,{data:{time5:r.layers.find(s=>s.time===300),time10:r.layers.find(s=>s.time===600),time15:r.layers.find(s=>s.time===900)}}),e.jsx(ae,{communityName:t.community_name,score:t.score,suggestions:t.suggestions,blindSpots:t.blind_spots}),t.poi_coverage&&v&&e.jsx(de,{poiCoverage:t.poi_coverage,center:v}),e.jsx(ie,{categories:t.score.categories})]}):e.jsxs("div",{className:"placeholder",children:[e.jsx("div",{className:"placeholder-icon",children:"🏘️"}),e.jsx("h3",{children:"开始分析"}),e.jsx("p",{children:'选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告'}),e.jsxs("div",{className:"feature-list",children:[e.jsxs("div",{className:"feature-item",children:[e.jsx("span",{className:"feature-icon",children:"🕐"}),e.jsx("span",{children:"计算5/10/15分钟步行范围"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx("span",{className:"feature-icon",children:"📍"}),e.jsx("span",{children:"分析周边设施覆盖"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx("span",{className:"feature-icon",children:"⚠️"}),e.jsx("span",{children:"识别服务盲区"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx("span",{className:"feature-icon",children:"📊"}),e.jsx("span",{children:"生成体检报告"})]})]})]})})]}),j.length>1&&e.jsx(o.Suspense,{fallback:e.jsx(w,{}),children:e.jsx(me,{history:J})}),j.length>1&&e.jsxs("div",{className:"history-section",children:[e.jsx("h3",{children:"📋 分析历史"}),e.jsx("div",{className:"history-list",children:j.slice(1).map((s,l)=>e.jsxs("div",{className:"history-item",children:[e.jsx("span",{className:"history-name",children:s.community_name}),e.jsxs("span",{className:"history-score",children:[s.score.total,"分"]}),e.jsx("span",{className:"history-level",children:s.score.level})]},l))})]})]}),e.jsx("footer",{className:"app-footer",children:e.jsxs("div",{className:"footer-content",children:[e.jsx("p",{children:"15分钟生活圈智能体检与规划助手 © 2025"}),e.jsx("p",{className:"footer-tech",children:"技术栈：React + FastAPI + 百度地图API + NetworkX"})]})})]})}T.createRoot(document.getElementById("root")).render(e.jsx(Y.StrictMode,{children:e.jsx(ue,{})}));export{e as j};
