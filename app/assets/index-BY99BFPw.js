import{r as m,a as D,R as H}from"./react-vendor-nf7bT_Uh.js";import{i as B}from"./echarts-vendor-BBmD_jO2.js";(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))i(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function c(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(t){if(t.ep)return;t.ep=!0;const o=c(t);fetch(t.href,o)}})();var W={exports:{}},P={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var U=m,G=Symbol.for("react.element"),J=Symbol.for("react.fragment"),Y=Object.prototype.hasOwnProperty,Z=U.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,q={key:!0,ref:!0,__self:!0,__source:!0};function A(n,a,c){var i,t={},o=null,r=null;c!==void 0&&(o=""+c),a.key!==void 0&&(o=""+a.key),a.ref!==void 0&&(r=a.ref);for(i in a)Y.call(a,i)&&!q.hasOwnProperty(i)&&(t[i]=a[i]);if(n&&n.defaultProps)for(i in a=n.defaultProps,a)t[i]===void 0&&(t[i]=a[i]);return{$$typeof:G,type:n,key:o,ref:r,props:t,_owner:Z.current}}P.Fragment=J;P.jsx=A;P.jsxs=A;W.exports=P;var e=W.exports,T={},F=D;T.createRoot=F.createRoot,T.hydrateRoot=F.hydrateRoot;const V=({map:n,center:a,visible:c})=>{const[i,t]=m.useState(null),[o,r]=m.useState(!1),[d,s]=m.useState(null),l=m.useRef([]),p=()=>{n&&l.current.length>0&&(l.current.forEach(x=>{try{n.removeOverlay(x)}catch{}}),l.current=[])},u=async()=>{if(a){r(!0),s(null);try{const x=[0,45,90,135,180,225,270,315],y=.015,S=[],C=x.map(async j=>{const g=j*Math.PI/180,v=a.lng+y*Math.sin(g),b=a.lat+y*Math.cos(g),k=await fetch("/api/graph/route",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin_lng:a.lng,origin_lat:a.lat,dest_lng:v,dest_lat:b})});return k.ok?(await k.json()).features||[]:[]});(await Promise.all(C)).forEach(j=>S.push(...j)),t({type:"FeatureCollection",features:S,total_distance:S.reduce((j,g)=>{var v;return j+(((v=g.properties)==null?void 0:v.distance)||0)},0),total_duration:S.reduce((j,g)=>{var v;return j+(((v=g.properties)==null?void 0:v.duration)||0)},0)})}catch(x){console.error("获取路线数据失败:",x),s("获取路线数据失败")}finally{r(!1)}}},f=()=>{if(!n||!i||!c)return;p();const x=window.BMap;i.features.forEach((y,S)=>{const C=y.geometry,L=y.properties;if(C.type==="LineString"){const j=C.coordinates.map(v=>new x.Point(v[0],v[1])),g=new x.Polyline(j,{strokeColor:"#1890ff",strokeWeight:4,strokeOpacity:.8,enableClicking:!0});if(n.addOverlay(g),l.current.push(g),g.addEventListener("click",()=>{const v=Math.floor(j.length/2),b=j[v],k=new x.InfoWindow(`<div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #1890ff;">路段信息</h4>
              <p style="margin: 4px 0;"><strong>距离：</strong>${L.distance_text}</p>
              <p style="margin: 4px 0;"><strong>时间：</strong>${L.duration_text}</p>
              <p style="margin: 4px 0;"><strong>道路：</strong>${L.road_name||"未知"}</p>
            </div>`,{width:200,height:100,title:"路线详情"});n.openInfoWindow(k,b)}),j.length>2){const v=Math.floor(j.length/2),b=j[v],k=new x.Label(`<div style="
              background: rgba(255, 255, 255, 0.9);
              border: 1px solid #1890ff;
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 12px;
              color: #333;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              ${L.distance_text} · ${L.duration_text}
            </div>`,{position:b,offset:new x.Size(-30,-15)});k.setStyle({backgroundColor:"transparent",border:"none"}),n.addOverlay(k),l.current.push(k)}}})};return m.useEffect(()=>{c&&a&&u()},[c,a]),m.useEffect(()=>{f()},[i,c]),m.useEffect(()=>()=>{p()},[]),o?e.jsxs("div",{className:"graph-loading",children:[e.jsx("div",{className:"loading-spinner"}),e.jsx("span",{children:"加载路网数据..."})]}):d?e.jsxs("div",{className:"graph-error",children:[e.jsxs("span",{children:["⚠️ ",d]}),e.jsx("button",{onClick:u,children:"重试"})]}):!c||!i?null:e.jsx("div",{className:"graph-info",children:e.jsxs("div",{className:"graph-stats",children:[e.jsxs("span",{className:"stat-item",children:["🛣️ 路段: ",i.features.length]}),e.jsxs("span",{className:"stat-item",children:["📏 总距离: ",(i.total_distance/1e3).toFixed(1),"km"]}),e.jsxs("span",{className:"stat-item",children:["⏱️ 总时间: ",Math.round(i.total_duration/60),"min"]})]})})},K=({map:n,poiData:a,visible:c})=>{const i=m.useRef([]),t={医疗:{emoji:"🏥",color:"#ff4d4f"},教育:{emoji:"🏫",color:"#1890ff"},购物:{emoji:"🛒",color:"#52c41a"},养老:{emoji:"👴",color:"#722ed1"},文体:{emoji:"🏃",color:"#13c2c2"},餐饮:{emoji:"🍜",color:"#faad14"}},o=()=>{n&&i.current.length>0&&(i.current.forEach(s=>{try{n.removeOverlay(s)}catch{}}),i.current=[])},r=()=>{if(!n||!a||!c)return;o();const s=window.BMap;Object.entries(a).forEach(([l,p])=>{const u=t[l]||{emoji:"📍",color:"#666"};(p.facilities||[]).forEach(x=>{if(x.location){const y=new s.Point(x.location.lng,x.location.lat),S=new s.Icon(`data:image/svg+xml,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="14" fill="${u.color}" opacity="0.8"/>
                <text x="15" y="20" text-anchor="middle" font-size="16">${u.emoji}</text>
              </svg>
            `)}`,new s.Size(30,30),{anchor:new s.Size(15,15)}),C=new s.Marker(y,{icon:S});n.addOverlay(C),i.current.push(C),C.addEventListener("click",()=>{const L=new s.InfoWindow(`<div style="padding: 10px;">
                <h4 style="margin: 0 0 8px 0; color: ${u.color};">
                  ${u.emoji} ${x.name}
                </h4>
                <p style="margin: 4px 0;"><strong>类别：</strong>${l}</p>
                <p style="margin: 4px 0;"><strong>地址：</strong>${x.address||"暂无"}</p>
                ${x.distance?`<p style="margin: 4px 0;"><strong>距离：</strong>${x.distance}米</p>`:""}
                ${x.tag?`<p style="margin: 4px 0;"><strong>标签：</strong>${x.tag}</p>`:""}
              </div>`,{width:250,height:120,title:"设施详情"});n.openInfoWindow(L,y)})}})})};if(m.useEffect(()=>{r()},[a,c]),m.useEffect(()=>()=>{o()},[]),!c||!a)return null;const d=Object.entries(a).map(([s,l])=>({category:s,count:l.count||0,level:l.level||"匮乏"}));return e.jsxs("div",{className:"poi-info",children:[e.jsx("h4",{children:"📍 周边设施"}),e.jsx("div",{className:"poi-stats",children:d.map(({category:s,count:l,level:p})=>{const u=t[s]||{emoji:"📍"};return e.jsxs("div",{className:"poi-stat-item",children:[e.jsx("span",{className:"poi-icon",children:u.emoji}),e.jsx("span",{className:"poi-category",children:s}),e.jsxs("span",{className:"poi-count",children:[l,"个"]}),e.jsx("span",{className:`poi-level poi-level-${p}`,children:p})]},s)})})]})},X=({loading:n,message:a="加载中..."})=>n?e.jsx("div",{className:"loading-overlay",children:e.jsxs("div",{className:"loading-content",children:[e.jsxs("div",{className:"loading-spinner",children:[e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"})]}),e.jsx("p",{className:"loading-message",children:a}),e.jsx("p",{className:"loading-submessage",children:"正在调用百度地图API计算等时圈..."})]})}):null,Q=({center:n,isochrone:a,poiCoverage:c,loading:i=!1,onCenterChange:t})=>{const o=m.useRef(null),r=m.useRef(null),[d,s]=m.useState(!1),[l,p]=m.useState(!0),[u,f]=m.useState(!0),[x,y]=m.useState(!0),[S,C]=m.useState(!1);m.useEffect(()=>{if(o.current&&!r.current){const j=window.BMap;if(j){const g=new j.Map(o.current),v=new j.Point(118.7969,32.0603);g.centerAndZoom(v,14),g.enableScrollWheelZoom(),g.addControl(new j.NavigationControl),g.addControl(new j.ScaleControl),g.addControl(new j.OverviewMapControl),g.addEventListener("click",L),r.current=g,s(!0)}}return()=>{r.current&&r.current.clearOverlays()}},[]);const L=m.useCallback(j=>{if(!S)return;const g=window.BMap,v=r.current;if(!v||!g)return;const b=j.point;v.clearOverlays();const k=new g.Icon(`data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12" fill="#ff4d4f" stroke="white" stroke-width="2"/>
          <text x="15" y="20" text-anchor="middle" fill="white" font-size="14">📍</text>
        </svg>
      `)}`,new g.Size(30,30),{anchor:new g.Size(15,15)}),$=new g.Marker(b,{icon:k});v.addOverlay($);const I=new g.InfoWindow(`<div style="padding: 10px;">
        <h4 style="margin: 0 0 8px 0; color: #ff4d4f;">📍 选中的位置</h4>
        <p style="margin: 4px 0;"><strong>经度：</strong>${b.lng.toFixed(6)}</p>
        <p style="margin: 4px 0;"><strong>纬度：</strong>${b.lat.toFixed(6)}</p>
        <button onclick="window.confirmCenterSelection(${b.lng}, ${b.lat})" style="
          margin-top: 8px;
          padding: 6px 12px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">确认选择</button>
      </div>`,{width:220,height:120,title:"位置信息"});v.openInfoWindow(I,b),window.confirmCenterSelection=(M,_)=>{t&&t(M,_),C(!1),v.closeInfoWindow()}},[S,t]);return m.useEffect(()=>{if(!r.current||!n)return;const j=r.current,g=window.BMap,v=new g.Point(n.lng,n.lat);j.centerAndZoom(v,15);const b=new g.Icon(`data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#1890ff" stroke="white" stroke-width="3"/>
          <circle cx="20" cy="20" r="8" fill="white"/>
        </svg>
      `)}`,new g.Size(40,40),{anchor:new g.Size(20,20)}),k=new g.Marker(v,{icon:b});j.addOverlay(k);const $=new g.InfoWindow(`<div style="padding: 10px;">
        <h4 style="margin: 0 0 8px 0; color: #1890ff;">📍 ${n.name}</h4>
        <p style="margin: 4px 0;"><strong>经度：</strong>${n.lng}</p>
        <p style="margin: 4px 0;"><strong>纬度：</strong>${n.lat}</p>
      </div>`,{width:200,height:80,title:"社区中心"});k.addEventListener("click",()=>{j.openInfoWindow($,v)})},[n]),m.useEffect(()=>{if(!r.current||!a)return;const j=r.current,g=window.BMap;if(j.getOverlays().forEach(v=>{v instanceof g.Polygon&&j.removeOverlay(v)}),a.polygon&&a.polygon.geometry){const b=a.polygon.geometry.coordinates[0].map($=>new g.Point($[0],$[1])),k=new g.Polygon(b,{strokeColor:"#1890ff",strokeWeight:2,strokeOpacity:.8,fillColor:"#1890ff",fillOpacity:.2});j.addOverlay(k)}},[a]),e.jsxs("div",{className:"map-container",children:[e.jsx("div",{ref:o,className:"map-view"}),i&&e.jsx(X,{loading:!0}),e.jsxs("div",{className:"layer-controls",children:[e.jsx("h4",{children:"图层控制"}),e.jsxs("div",{className:"layer-buttons",children:[e.jsx("button",{className:`layer-button ${l?"active":""}`,onClick:()=>p(!l),children:"🛣️ Graph路网"}),e.jsx("button",{className:`layer-button ${u?"active":""}`,onClick:()=>f(!u),children:"📍 POI设施"}),e.jsx("button",{className:`layer-button ${x?"active":""}`,onClick:()=>y(!x),children:"⚠️ 盲区"}),e.jsx("button",{className:`layer-button ${S?"active":""}`,onClick:()=>C(!S),children:"🎯 点击选位"})]})]}),e.jsxs("div",{className:"map-legend",children:[e.jsx("h4",{children:"图例"}),e.jsxs("div",{className:"legend-items",children:[e.jsxs("div",{className:"legend-item",children:[e.jsx("span",{className:"legend-color",style:{backgroundColor:"#1890ff"}}),e.jsx("span",{children:"15分钟步行范围"})]}),e.jsxs("div",{className:"legend-item",children:[e.jsx("span",{className:"legend-color",style:{backgroundColor:"#52c41a"}}),e.jsx("span",{children:"POI设施"})]}),e.jsxs("div",{className:"legend-item",children:[e.jsx("span",{className:"legend-color",style:{backgroundColor:"#ff4d4f"}}),e.jsx("span",{children:"服务盲区"})]})]})]}),l&&d&&n&&e.jsx(V,{map:r.current,center:n,visible:l}),u&&d&&c&&e.jsx(K,{map:r.current,poiData:c,visible:u}),S&&e.jsx("div",{className:"click-mode-hint",children:e.jsx("span",{children:"🎯 点击地图选择位置"})})]})},ee=({communityName:n,score:a,suggestions:c,blindSpots:i})=>{const t=r=>{switch(r){case"优秀":return"#52c41a";case"良好":return"#1890ff";case"一般":return"#faad14";case"需改善":return"#ff4d4f";default:return"#666"}},o=r=>{const d={高:"#ff4d4f",中:"#faad14",低:"#52c41a"};return e.jsx("span",{className:"priority-tag",style:{backgroundColor:d[r]||"#666"},children:r})};return e.jsxs("div",{className:"report-container",children:[e.jsxs("h2",{children:[n," - 生活圈体检报告"]}),e.jsxs("div",{className:"score-section",children:[e.jsxs("div",{className:"score-circle",style:{borderColor:t(a.level)},children:[e.jsx("span",{className:"score-number",children:a.total}),e.jsx("span",{className:"score-level",children:a.level})]}),e.jsxs("div",{className:"score-detail",children:[e.jsx("p",{children:"综合评分"}),a.blind_spot_penalty>0&&e.jsxs("p",{className:"penalty-note",children:["盲区扣分: -",a.blind_spot_penalty,"分"]})]})]}),e.jsxs("div",{className:"category-scores",children:[e.jsx("h3",{children:"各类设施评分"}),e.jsx("div",{className:"category-grid",children:Object.entries(a.categories).map(([r,d])=>e.jsxs("div",{className:"category-item",children:[e.jsx("span",{className:"category-name",children:r}),e.jsx("div",{className:"category-bar",children:e.jsx("div",{className:"category-fill",style:{width:`${d}%`,backgroundColor:d>=80?"#52c41a":d>=60?"#1890ff":"#ff4d4f"}})}),e.jsx("span",{className:"category-score",children:d})]},r))})]}),c.length>0&&e.jsxs("div",{className:"suggestions-section",children:[e.jsx("h3",{children:"改善建议"}),e.jsx("ul",{className:"suggestions-list",children:c.map((r,d)=>e.jsxs("li",{className:"suggestion-item",children:[o(r.priority),e.jsxs("span",{className:"suggestion-category",children:["[",r.category,"]"]}),e.jsx("span",{className:"suggestion-message",children:r.message})]},d))})]}),i.length>0&&e.jsxs("div",{className:"blind-spots-section",children:[e.jsxs("h3",{children:["服务盲区 (",i.length,"个)"]}),e.jsx("div",{className:"blind-spots-list",children:i.map((r,d)=>e.jsxs("div",{className:"blind-spot-item",children:[e.jsx("span",{className:"blind-spot-icon",children:"⚠️"}),e.jsxs("div",{className:"blind-spot-info",children:[e.jsx("span",{className:"blind-spot-category",children:r.category}),e.jsx("span",{className:"blind-spot-desc",children:r.description})]})]},d))})]})]})},se=({categories:n})=>{const a=m.useRef(null),c=m.useRef(null);return m.useEffect(()=>{if(!a.current)return;const i=B(a.current);return c.current=i,()=>{i.dispose()}},[]),m.useEffect(()=>{if(!c.current)return;const i=Object.keys(n),t=Object.values(n),o={title:{text:"设施覆盖雷达图",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},radar:{indicator:i.map(r=>({name:r,max:100})),shape:"circle",splitNumber:5,axisName:{color:"#333",fontSize:12},splitLine:{lineStyle:{color:"#ddd"}},splitArea:{show:!0,areaStyle:{color:["rgba(24, 144, 255, 0.1)","rgba(24, 144, 255, 0.2)"]}}},series:[{type:"radar",data:[{value:t,name:"设施覆盖评分",areaStyle:{color:"rgba(24, 144, 255, 0.3)"},lineStyle:{color:"#1890ff",width:2},itemStyle:{color:"#1890ff"}}]}]};c.current.setOption(o)},[n]),m.useEffect(()=>{const i=()=>{var t;(t=c.current)==null||t.resize()};return window.addEventListener("resize",i),()=>window.removeEventListener("resize",i)},[]),e.jsx("div",{className:"radar-chart-container",children:e.jsx("div",{ref:a,className:"radar-chart"})})},te=({data:n,onTimeChange:a})=>{const[c,i]=m.useState(15),t=[{value:5,label:"5分钟",icon:"🚶",color:"#52c41a"},{value:10,label:"10分钟",icon:"🚶‍♂️",color:"#faad14"},{value:15,label:"15分钟",icon:"🚶‍♀️",color:"#1890ff"}],o=s=>{i(s),a(s)},d=t.map(s=>{var p,u,f;let l=0;return s.value===5?l=((p=n.time5)==null?void 0:p.area)||0:s.value===10?l=((u=n.time10)==null?void 0:u.area)||0:s.value===15&&(l=((f=n.time15)==null?void 0:f.area)||0),{...s,area:l,areaText:l>0?`${(l/1e6).toFixed(2)} km²`:"计算中"}});return e.jsxs("div",{className:"time-comparison",children:[e.jsx("h4",{children:"⏱️ 时间维度对比"}),e.jsx("div",{className:"time-selector",children:t.map(s=>e.jsxs("button",{className:`time-button ${c===s.value?"active":""}`,style:{"--color":s.color},onClick:()=>o(s.value),children:[e.jsx("span",{className:"time-icon",children:s.icon}),e.jsx("span",{className:"time-label",children:s.label})]},s.value))}),e.jsx("div",{className:"area-stats",children:d.map(s=>e.jsxs("div",{className:`area-item ${c===s.value?"active":""}`,children:[e.jsx("div",{className:"area-color",style:{backgroundColor:s.color}}),e.jsxs("div",{className:"area-info",children:[e.jsx("span",{className:"area-time",children:s.label}),e.jsx("span",{className:"area-value",children:s.areaText})]})]},s.value))}),e.jsx("div",{className:"area-chart",children:e.jsx("div",{className:"chart-bars",children:d.map(s=>{const l=Math.max(...d.map(u=>u.area||1)),p=s.area>0?s.area/l*100:0;return e.jsxs("div",{className:"chart-bar-container",children:[e.jsx("div",{className:"chart-bar-label",children:s.label}),e.jsx("div",{className:"chart-bar-track",children:e.jsx("div",{className:"chart-bar-fill",style:{width:`${p}%`,backgroundColor:s.color}})}),e.jsx("div",{className:"chart-bar-value",children:s.areaText})]},s.value)})})})]})},ne=({data:n})=>{const a=m.useRef(null),c=m.useRef(null);m.useEffect(()=>{if(!a.current)return;const o=B(a.current);return c.current=o,()=>{o.dispose()}},[]),m.useEffect(()=>{var l,p,u;if(!c.current)return;const o=["5分钟","10分钟","15分钟"],r=[(l=n.time5)!=null&&l.area?n.time5.area/1e6:0,(p=n.time10)!=null&&p.area?n.time10.area/1e6:0,(u=n.time15)!=null&&u.area?n.time15.area/1e6:0],d=["#52c41a","#faad14","#1890ff"],s={title:{text:"等时圈面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:f=>{const x=f[0];return`${x.name}<br/>面积: ${x.value.toFixed(2)} km²`}},xAxis:{type:"category",data:o,axisLabel:{fontSize:12}},yAxis:{type:"value",name:"面积 (km²)",axisLabel:{fontSize:12}},series:[{type:"bar",data:r.map((f,x)=>({value:f,itemStyle:{color:d[x],borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};c.current.setOption(s)},[n]),m.useEffect(()=>{const o=()=>{var r;(r=c.current)==null||r.resize()};return window.addEventListener("resize",o),()=>window.removeEventListener("resize",o)},[]);const t=(()=>{var r,d;return!((r=n.time5)!=null&&r.area)||!((d=n.time15)!=null&&d.area)?null:((n.time15.area-n.time5.area)/n.time5.area*100).toFixed(1)})();return e.jsxs("div",{className:"area-comparison-container",children:[e.jsx("div",{ref:a,className:"area-chart"}),t&&e.jsxs("div",{className:"growth-info",children:[e.jsx("span",{className:"growth-label",children:"15分钟比5分钟面积增长:"}),e.jsxs("span",{className:"growth-value",children:["+",t,"%"]})]})]})},ae=({poiCoverage:n,center:a})=>{const c={医疗:{emoji:"🏥",color:"#ff4d4f"},教育:{emoji:"🏫",color:"#1890ff"},购物:{emoji:"🛒",color:"#52c41a"},养老:{emoji:"👴",color:"#722ed1"},文体:{emoji:"🏃",color:"#13c2c2"},餐饮:{emoji:"🍜",color:"#faad14"}},i=s=>Math.round(s/1.2/60),o=(()=>{const s=[];return Object.entries(n).forEach(([l,p])=>{p.facilities.forEach(u=>{s.push({...u,category:l})})}),s.sort((l,p)=>(l.distance||0)-(p.distance||0))})(),d=(()=>{const s={};return Object.keys(n).forEach(l=>{const p=o.filter(u=>u.category===l);s[l]=p.length>0?p[0]:null}),s})();return e.jsxs("div",{className:"facility-accessibility",children:[e.jsx("h4",{children:"📍 设施可达性分析"}),e.jsxs("div",{className:"nearest-facilities",children:[e.jsx("h5",{children:"各类最近设施"}),e.jsx("div",{className:"nearest-grid",children:Object.entries(d).map(([s,l])=>{const p=c[s]||{emoji:"📍"};return e.jsxs("div",{className:"nearest-item",children:[e.jsx("span",{className:"nearest-icon",children:p.emoji}),e.jsxs("div",{className:"nearest-info",children:[e.jsx("span",{className:"nearest-category",children:s}),l?e.jsxs(e.Fragment,{children:[e.jsx("span",{className:"nearest-name",children:l.name}),e.jsxs("span",{className:"nearest-distance",children:[l.distance?`${l.distance}米`:"未知",l.distance&&` (${i(l.distance)}分钟)`]})]}):e.jsx("span",{className:"nearest-none",children:"暂无数据"})]})]},s)})})]}),o.length>0&&e.jsxs("div",{className:"facility-list",children:[e.jsx("h5",{children:"周边设施列表 (前10个)"}),e.jsx("div",{className:"facility-items",children:o.slice(0,10).map((s,l)=>{const p=c[s.category]||{emoji:"📍"};return e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-icon",children:p.emoji}),e.jsxs("div",{className:"facility-info",children:[e.jsx("span",{className:"facility-name",children:s.name}),e.jsx("span",{className:"facility-address",children:s.address||"暂无地址"})]}),e.jsx("div",{className:"facility-distance",children:s.distance&&e.jsxs(e.Fragment,{children:[e.jsxs("span",{className:"distance-value",children:[s.distance,"米"]}),e.jsxs("span",{className:"distance-time",children:["步行",i(s.distance),"分钟"]})]})})]},l)})})]}),e.jsxs("div",{className:"accessibility-score",children:[e.jsx("h5",{children:"可达性评分"}),e.jsx("div",{className:"score-items",children:Object.entries(n).map(([s,l])=>{const p=c[s]||{emoji:"📍"},u=l.count>=5?100:l.count>=3?80:l.count>=1?60:30;return e.jsxs("div",{className:"score-item",children:[e.jsx("span",{className:"score-icon",children:p.emoji}),e.jsx("span",{className:"score-category",children:s}),e.jsx("div",{className:"score-bar",children:e.jsx("div",{className:"score-fill",style:{width:`${u}%`,backgroundColor:u>=80?"#52c41a":u>=60?"#1890ff":"#ff4d4f"}})}),e.jsx("span",{className:"score-value",children:u})]},s)})})]})]})},re=({onCenterSelect:n,currentCenter:a})=>{var p,u;const[c,i]=m.useState(((p=a==null?void 0:a.lng)==null?void 0:p.toString())||"118.7784"),[t,o]=m.useState(((u=a==null?void 0:a.lat)==null?void 0:u.toString())||"32.0663"),[r,d]=m.useState((a==null?void 0:a.name)||"自定义位置"),s=f=>{f.preventDefault();const x=parseFloat(c),y=parseFloat(t);if(isNaN(x)||isNaN(y)){alert("请输入有效的经纬度");return}if(x<73||x>135||y<3||y>53){alert("经纬度超出中国范围");return}n(x,y)},l=()=>{navigator.geolocation?navigator.geolocation.getCurrentPosition(f=>{const{longitude:x,latitude:y}=f.coords;i(x.toFixed(6)),o(y.toFixed(6)),d("当前位置"),n(x,y)},f=>{alert("无法获取当前位置，请手动输入"),console.error("获取位置失败:",f)}):alert("浏览器不支持地理定位")};return e.jsxs("div",{className:"custom-center",children:[e.jsx("h4",{children:"📍 自定义中心点"}),e.jsxs("form",{onSubmit:s,children:[e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"经度:"}),e.jsx("input",{type:"number",step:"0.000001",value:c,onChange:f=>i(f.target.value),placeholder:"118.7784"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"纬度:"}),e.jsx("input",{type:"number",step:"0.000001",value:t,onChange:f=>o(f.target.value),placeholder:"32.0663"})]}),e.jsxs("div",{className:"form-group",children:[e.jsx("label",{children:"名称:"}),e.jsx("input",{type:"text",value:r,onChange:f=>d(f.target.value),placeholder:"自定义位置"})]}),e.jsxs("div",{className:"button-group",children:[e.jsx("button",{type:"submit",className:"apply-button",children:"应用"}),e.jsx("button",{type:"button",className:"location-button",onClick:l,children:"📱 获取当前位置"})]})]}),a&&e.jsxs("div",{className:"current-info",children:[e.jsx("p",{children:"当前中心点:"}),e.jsx("p",{className:"center-name",children:a.name}),e.jsxs("p",{className:"center-coord",children:["(",a.lng.toFixed(4),", ",a.lat.toFixed(4),")"]})]}),e.jsxs("div",{className:"preset-locations",children:[e.jsx("h5",{children:"预设位置"}),e.jsx("div",{className:"preset-list",children:[{name:"南京市中心",lng:118.7969,lat:32.0603},{name:"新街口",lng:118.7874,lat:32.0423},{name:"鼓楼广场",lng:118.7784,lat:32.0663},{name:"夫子庙",lng:118.7894,lat:32.0233}].map(f=>e.jsx("button",{className:"preset-button",onClick:()=>{i(f.lng.toString()),o(f.lat.toString()),d(f.name),n(f.lng,f.lat)},children:f.name},f.name))})]})]})},ie=({history:n})=>{const a=m.useRef(null),c=m.useRef(null),[i,t]=m.useState("score");return m.useEffect(()=>{if(!a.current)return;const o=B(a.current);return c.current=o,()=>{o.dispose()}},[]),m.useEffect(()=>{var r;if(!c.current||n.length===0)return;let o;if(i==="score")o={title:{text:"社区综合评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:d=>{const s=d[0];return`${s.name}<br/>评分: ${s.value}`}},xAxis:{type:"category",data:n.map(d=>d.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"评分",min:0,max:100},series:[{type:"bar",data:n.map(d=>({value:d.score,itemStyle:{color:d.score>=80?"#52c41a":d.score>=60?"#1890ff":"#ff4d4f",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",fontSize:12}}]};else if(i==="area")o={title:{text:"15分钟步行范围面积对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"axis",formatter:d=>{const s=d[0];return`${s.name}<br/>面积: ${s.value.toFixed(2)} km²`}},xAxis:{type:"category",data:n.map(d=>d.name),axisLabel:{rotate:30,fontSize:11}},yAxis:{type:"value",name:"面积 (km²)"},series:[{type:"bar",data:n.map(d=>({value:d.area/1e6,itemStyle:{color:"#1890ff",borderRadius:[4,4,0,0]}})),barWidth:"40%",label:{show:!0,position:"top",formatter:"{c} km²",fontSize:12}}]};else{const d=Object.keys(((r=n[0])==null?void 0:r.categories)||{}),s=["#1890ff","#52c41a","#faad14","#ff4d4f","#722ed1"];o={title:{text:"各类设施评分对比",left:"center",textStyle:{fontSize:14}},tooltip:{trigger:"item"},legend:{bottom:0,data:n.map(l=>l.name)},radar:{indicator:d.map(l=>({name:l,max:100})),shape:"circle",splitNumber:5},series:[{type:"radar",data:n.map((l,p)=>({value:d.map(u=>l.categories[u]||0),name:l.name,lineStyle:{color:s[p%s.length]},areaStyle:{color:s[p%s.length],opacity:.1},itemStyle:{color:s[p%s.length]}}))}]}}c.current.setOption(o)},[n,i]),m.useEffect(()=>{const o=()=>{var r;(r=c.current)==null||r.resize()};return window.addEventListener("resize",o),()=>window.removeEventListener("resize",o)},[]),n.length<2?e.jsxs("div",{className:"community-comparison",children:[e.jsx("h4",{children:"📊 社区对比"}),e.jsx("p",{className:"comparison-hint",children:"分析至少2个社区后可进行对比"})]}):e.jsxs("div",{className:"community-comparison",children:[e.jsx("h4",{children:"📊 社区对比"}),e.jsxs("div",{className:"metric-selector",children:[e.jsx("button",{className:`metric-button ${i==="score"?"active":""}`,onClick:()=>t("score"),children:"综合评分"}),e.jsx("button",{className:`metric-button ${i==="area"?"active":""}`,onClick:()=>t("area"),children:"覆盖面积"}),e.jsx("button",{className:`metric-button ${i==="categories"?"active":""}`,onClick:()=>t("categories"),children:"各类设施"})]}),e.jsx("div",{ref:a,className:"comparison-chart"}),e.jsx("div",{className:"comparison-table",children:e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"社区"}),e.jsx("th",{children:"评分"}),e.jsx("th",{children:"等级"}),e.jsx("th",{children:"面积"})]})}),e.jsx("tbody",{children:n.map((o,r)=>e.jsxs("tr",{children:[e.jsx("td",{children:o.name}),e.jsx("td",{className:"score-cell",children:o.score}),e.jsx("td",{children:e.jsx("span",{className:`level-badge level-${o.level}`,children:o.level})}),e.jsxs("td",{children:[(o.area/1e6).toFixed(2)," km²"]})]},r))})]})})]})},z=[{lng:118.7784,lat:32.0663,name:"鼓楼区湖南路街道"},{lng:118.7854,lat:32.0553,name:"鼓楼区中央门街道"},{lng:118.8034,lat:32.0683,name:"玄武区新街口街道"},{lng:118.7894,lat:32.0433,name:"秦淮区夫子庙街道"}];function oe(n,a){const{community_name:c,score:i,suggestions:t,blind_spots:o}=n,r=Object.entries(i.categories).map(([p,u])=>{const f=u,x=f>=80?"#52c41a":f>=60?"#1890ff":"#faad14";return`
        <div class="category-item">
          <span class="category-name">${p}</span>
          <div class="category-bar-container">
            <div class="category-bar" style="width: ${f}%; background-color: ${x}"></div>
          </div>
          <span class="category-score">${f}分</span>
        </div>
      `}).join(""),d=t.map(p=>`
      <div class="suggestion-item ${p.priority==="高"?"high-priority":""}">
        <span class="suggestion-priority">[${p.priority}]</span>
        <span class="suggestion-category">${p.category}</span>
        <span class="suggestion-message">${p.message}</span>
      </div>
    `).join(""),s=o.length>0?o.map(p=>`
          <div class="blind-spot-item">
            <span class="spot-icon">⚠️</span>
            <span class="spot-category">${p.category}:</span>
            <span class="spot-description">${p.description}</span>
          </div>
        `).join(""):'<p class="no-spots">✅ 未发现明显服务盲区</p>';return`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${c} - 15分钟生活圈体检报告</title>
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
      <p>${c}</p>
    </div>

    <div class="score-section">
      <div class="score-circle">
        <span class="score-number">${i.total}</span>
        <span class="score-label">综合评分</span>
      </div>
      <div class="score-info">
        <div class="score-level">评级: ${i.level}</div>
        <div class="score-detail">盲区扣分: -${i.blind_spot_penalty}分</div>
        <div class="score-detail">分析时间: ${new Date().toLocaleString("zh-CN")}</div>
      </div>
    </div>

    <div class="section">
      <h2>📊 各类设施评分</h2>
      ${r}
    </div>

    

    <div class="section">
      <h2>💡 改善建议</h2>
      ${d}
    </div>

    <div class="section">
      <h2>⚠️ 服务盲区</h2>
      ${s}
    </div>

    <div class="report-footer">
      <p>15分钟生活圈智能体检与规划助手 - 基于百度地图开放能力</p>
      <p>报告生成时间: ${new Date().toLocaleString("zh-CN")}</p>
    </div>
  </div>
</body>
</html>
  `}function le(n,a){const c=oe(n),i=window.open("","_blank");if(!i){alert("请允许弹出窗口以导出报告");return}i.document.write(c),i.document.close(),i.onload=()=>{i.print()}}const w={Home:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}),e.jsx("polyline",{points:"9 22 9 12 15 12 15 22"})]}),Clock:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"12",r:"10"}),e.jsx("polyline",{points:"12 6 12 12 16 14"})]}),MapPin:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("circle",{cx:"12",cy:"10",r:"3"}),e.jsx("path",{d:"M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"})]}),AlertTriangle:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"}),e.jsx("line",{x1:"12",y1:"9",x2:"12",y2:"13"}),e.jsx("line",{x1:"12",y1:"17",x2:"12.01",y2:"17"})]}),BarChart:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"20",x2:"18",y2:"10"}),e.jsx("line",{x1:"12",y1:"20",x2:"12",y2:"4"}),e.jsx("line",{x1:"6",y1:"20",x2:"6",y2:"14"})]}),Play:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polygon",{points:"5 3 19 12 5 21 5 3"})}),Map:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"}),e.jsx("line",{x1:"8",y1:"2",x2:"8",y2:"18"}),e.jsx("line",{x1:"16",y1:"6",x2:"16",y2:"22"})]}),History:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M1 4v6h6"}),e.jsx("path",{d:"M3.51 15a9 9 0 1 0 2.13-9.36L1 10"})]}),Refresh:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polyline",{points:"23 4 23 10 17 10"}),e.jsx("path",{d:"M20.49 15a9 9 0 1 1-2.12-9.36L23 10"})]}),ArrowLeft:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"19",y1:"12",x2:"5",y2:"12"}),e.jsx("polyline",{points:"12 19 5 12 12 5"})]}),Download:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}),e.jsx("polyline",{points:"7 10 12 15 17 10"}),e.jsx("line",{x1:"12",y1:"15",x2:"12",y2:"3"})]}),Activity:()=>e.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("polyline",{points:"22 12 18 12 15 21 9 3 6 12 2 12"})}),Layers:()=>e.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("polygon",{points:"12 2 2 7 12 12 22 7 12 2"}),e.jsx("polyline",{points:"2 17 12 22 22 17"}),e.jsx("polyline",{points:"2 12 12 17 22 12"})]})};function ce(){var M,_;const[n,a]=m.useState(null),[c,i]=m.useState(null),[t,o]=m.useState(null),[r,d]=m.useState(null),[s,l]=m.useState(15),[p,u]=m.useState(!1),[f,x]=m.useState(null),[y,S]=m.useState([]),[C,L]=m.useState(!1);m.useEffect(()=>{z.length>0&&a(z[0])},[]);const j=()=>c||n,g=async()=>{const h=j();if(h){u(!0),x(null);try{const[N,R]=await Promise.all([fetch("/api/analysis/report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:h.lng,lat:h.lat,community_name:h.name})}),fetch("/api/isochrone/multi-time",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lng:h.lng,lat:h.lat,directions:36})})]);if(!N.ok)throw new Error("分析请求失败");const E=await N.json();if(o(E),R.ok){const O=await R.json();d(O)}S(O=>[E,...O.slice(0,4)])}catch(N){x(N instanceof Error?N.message:"分析过程中出现错误")}finally{u(!1)}}},v=h=>{l(h)},b=(h,N)=>{i({lng:h,lat:N,name:"自定义位置"})},k=()=>{if(!r)return t==null?void 0:t.isochrone;const h=r.layers.find(N=>N.time===s);return h?{boundary_points:h.boundary_points,polygon:h.polygon}:t==null?void 0:t.isochrone},$=()=>{t&&le(t)},I=y.slice(0,5).map(h=>({name:h.community_name,score:h.score.total,level:h.score.level,categories:h.score.categories,area:h.isochrone.area}));return e.jsxs("div",{className:"app-container",children:[e.jsx("header",{className:"app-header",children:e.jsxs("div",{className:"header-content",children:[e.jsxs("div",{className:"header-left",children:[e.jsxs("h1",{children:[e.jsx(w.Home,{}),"15分钟生活圈智能体检与规划助手"]}),e.jsx("p",{children:"基于百度地图的社区生活圈分析工具"})]}),e.jsx("div",{className:"header-right",children:e.jsxs("a",{href:"../",className:"back-button",children:[e.jsx(w.ArrowLeft,{}),"返回首页"]})})]})}),e.jsxs("main",{className:"app-main",children:[e.jsxs("div",{className:"controls-panel",children:[e.jsxs("div",{className:"control-group",children:[e.jsx("label",{children:"选择社区："}),e.jsx("select",{value:n?`${n.lng},${n.lat}`:"",onChange:h=>{const[N,R]=h.target.value.split(",").map(Number),E=z.find(O=>O.lng===N&&O.lat===R);a(E||null),i(null)},children:z.map((h,N)=>e.jsx("option",{value:`${h.lng},${h.lat}`,children:h.name},N))})]}),e.jsx("button",{className:"analyze-button",onClick:g,disabled:p||!n&&!c,children:p?e.jsxs(e.Fragment,{children:[e.jsx(w.Refresh,{}),"分析中..."]}):e.jsxs(e.Fragment,{children:[e.jsx(w.Play,{}),"开始体检"]})}),e.jsxs("button",{className:"analyze-button secondary",onClick:()=>L(!C),children:[e.jsx(w.MapPin,{}),C?"隐藏自定义位置":"自定义位置"]}),t&&e.jsxs("button",{className:"analyze-button secondary",onClick:$,children:[e.jsx(w.Download,{}),"导出PDF"]})]}),f&&e.jsxs("div",{className:"error-banner",children:[e.jsx(w.AlertTriangle,{}),e.jsx("span",{children:f}),e.jsxs("button",{onClick:g,children:[e.jsx(w.Refresh,{}),"重试"]})]}),e.jsxs("div",{className:"main-content",children:[e.jsxs("div",{className:"map-panel",children:[C&&e.jsx(re,{onCenterSelect:b,currentCenter:j()}),e.jsx(Q,{center:j(),isochrone:k(),poiCoverage:t==null?void 0:t.poi_coverage,blindSpots:t==null?void 0:t.blind_spots,loading:p})]}),e.jsx("div",{className:"data-panel",children:t?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"score-card",children:[e.jsxs("div",{className:"score-header",children:[e.jsx(w.Activity,{}),e.jsx("span",{children:"综合评分"})]}),e.jsx("div",{className:"score-value",children:t.score.total}),e.jsx("div",{className:"score-level",children:t.score.level})]}),e.jsxs("div",{className:"metrics-grid",children:[e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(w.Map,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[t.isochrone.area.toFixed(2)," km²"]}),e.jsx("div",{className:"metric-label",children:"覆盖面积"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(w.Layers,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:t.poi_coverage?Object.values(t.poi_coverage).reduce((h,N)=>h+N.count,0):0}),e.jsx("div",{className:"metric-label",children:"周边设施"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(w.AlertTriangle,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsx("div",{className:"metric-value",children:((M=t.blind_spots)==null?void 0:M.length)||0}),e.jsx("div",{className:"metric-label",children:"服务盲区"})]})]}),e.jsxs("div",{className:"metric-card",children:[e.jsx("div",{className:"metric-icon",children:e.jsx(w.Clock,{})}),e.jsxs("div",{className:"metric-info",children:[e.jsxs("div",{className:"metric-value",children:[s/60," 分钟"]}),e.jsx("div",{className:"metric-label",children:"步行时间"})]})]})]}),((_=t.poi_coverage)==null?void 0:_.categories)&&e.jsxs("div",{className:"facility-summary",children:[e.jsxs("h3",{children:[e.jsx(w.BarChart,{}),"设施分布"]}),e.jsx("div",{className:"facility-list",children:Object.entries(t.poi_coverage.categories).map(([h,N])=>e.jsxs("div",{className:"facility-item",children:[e.jsx("span",{className:"facility-name",children:h}),e.jsx("span",{className:"facility-count",children:N})]},h))})]})]}):e.jsxs("div",{className:"empty-state",children:[e.jsx("div",{className:"empty-icon",children:e.jsx(w.Map,{})}),e.jsx("h3",{children:"开始分析"}),e.jsx("p",{children:'选择一个社区或自定义位置，点击"开始体检"按钮生成分析报告'}),e.jsxs("div",{className:"feature-list",children:[e.jsxs("div",{className:"feature-item",children:[e.jsx(w.Clock,{}),e.jsx("span",{children:"计算5/10/15分钟步行范围"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(w.MapPin,{}),e.jsx("span",{children:"分析周边设施覆盖"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(w.AlertTriangle,{}),e.jsx("span",{children:"识别服务盲区"})]}),e.jsxs("div",{className:"feature-item",children:[e.jsx(w.BarChart,{}),e.jsx("span",{children:"生成体检报告"})]})]})]})})]}),t&&e.jsxs("div",{className:"detail-section",children:[r&&e.jsx("div",{className:"detail-card",children:e.jsx(te,{data:{time5:r.layers.find(h=>h.time===300),time10:r.layers.find(h=>h.time===600),time15:r.layers.find(h=>h.time===900)},onTimeChange:v})}),r&&e.jsx("div",{className:"detail-card",children:e.jsx(ne,{data:{time5:r.layers.find(h=>h.time===300),time10:r.layers.find(h=>h.time===600),time15:r.layers.find(h=>h.time===900)}})}),e.jsx("div",{className:"detail-card full-width",children:e.jsx(ee,{communityName:t.community_name,score:t.score,suggestions:t.suggestions,blindSpots:t.blind_spots})}),t.poi_coverage&&j()&&e.jsx("div",{className:"detail-card",children:e.jsx(ae,{poiCoverage:t.poi_coverage,center:j()})}),e.jsx("div",{className:"detail-card",children:e.jsx(se,{categories:t.score.categories})})]}),y.length>1&&e.jsx("div",{className:"comparison-section",children:e.jsx(ie,{history:I})}),y.length>1&&e.jsxs("div",{className:"history-section",children:[e.jsxs("h3",{children:[e.jsx(w.History,{}),"分析历史"]}),e.jsx("div",{className:"history-list",children:y.slice(1).map((h,N)=>e.jsxs("div",{className:"history-item",children:[e.jsx("span",{className:"history-name",children:h.community_name}),e.jsxs("span",{className:"history-score",children:[h.score.total,"分"]}),e.jsx("span",{className:"history-level",children:h.score.level})]},N))})]})]}),e.jsx("footer",{className:"app-footer",children:e.jsxs("div",{className:"footer-content",children:[e.jsx("p",{children:"15分钟生活圈智能体检与规划助手 © 2025"}),e.jsx("p",{className:"footer-tech",children:"技术栈：React + FastAPI + 百度地图API + NetworkX"})]})})]})}T.createRoot(document.getElementById("root")).render(e.jsx(H.StrictMode,{children:e.jsx(ce,{})}));
