import{j as e}from"./index-BYKaJ-HA.js";import{r as i}from"./react-vendor-nf7bT_Uh.js";const S=({map:o,center:a,visible:m})=>{const[g,j]=i.useState(null),[k,d]=i.useState(!1),[N,c]=i.useState(null),l=i.useRef([]),v=()=>{o&&l.current.length>0&&(l.current.forEach(r=>{try{o.removeOverlay(r)}catch{}}),l.current=[])},h=async()=>{if(a){d(!0),c(null);try{const r=[0,45,90,135,180,225,270,315],x=.015,u=[],w=r.map(async t=>{const n=t*Math.PI/180,s=a.lng+x*Math.sin(n),p=a.lat+x*Math.cos(n),f=await fetch("/api/graph/route",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({origin_lng:a.lng,origin_lat:a.lat,dest_lng:s,dest_lat:p})});return f.ok?(await f.json()).features||[]:[]});(await Promise.all(w)).forEach(t=>u.push(...t)),j({type:"FeatureCollection",features:u,total_distance:u.reduce((t,n)=>{var s;return t+(((s=n.properties)==null?void 0:s.distance)||0)},0),total_duration:u.reduce((t,n)=>{var s;return t+(((s=n.properties)==null?void 0:s.duration)||0)},0)})}catch(r){console.error("获取路线数据失败:",r),c("获取路线数据失败")}finally{d(!1)}}},b=()=>{if(!o||!g||!m)return;v();const r=window.BMap;g.features.forEach((x,u)=>{const w=x.geometry,y=x.properties;if(w.type==="LineString"){const t=w.coordinates.map(s=>new r.Point(s[0],s[1])),n=new r.Polyline(t,{strokeColor:"#1890ff",strokeWeight:4,strokeOpacity:.8,enableClicking:!0});if(o.addOverlay(n),l.current.push(n),n.addEventListener("click",()=>{const s=Math.floor(t.length/2),p=t[s],f=new r.InfoWindow(`<div style="padding: 10px;">
              <h4 style="margin: 0 0 8px 0; color: #1890ff;">路段信息</h4>
              <p style="margin: 4px 0;"><strong>距离：</strong>${y.distance_text}</p>
              <p style="margin: 4px 0;"><strong>时间：</strong>${y.duration_text}</p>
              <p style="margin: 4px 0;"><strong>道路：</strong>${y.road_name||"未知"}</p>
            </div>`,{width:200,height:100,title:"路线详情"});o.openInfoWindow(f,p)}),t.length>2){const s=Math.floor(t.length/2),p=t[s],f=new r.Label(`<div style="
              background: rgba(255, 255, 255, 0.9);
              border: 1px solid #1890ff;
              border-radius: 4px;
              padding: 4px 8px;
              font-size: 12px;
              color: #333;
              white-space: nowrap;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
              ${y.distance_text} · ${y.duration_text}
            </div>`,{position:p,offset:new r.Size(-30,-15)});f.setStyle({backgroundColor:"transparent",border:"none"}),o.addOverlay(f),l.current.push(f)}}})};return i.useEffect(()=>{m&&a&&h()},[m,a]),i.useEffect(()=>{b()},[g,m]),i.useEffect(()=>()=>{v()},[]),k?e.jsxs("div",{className:"graph-loading",children:[e.jsx("div",{className:"loading-spinner"}),e.jsx("span",{children:"加载路网数据..."})]}):N?e.jsxs("div",{className:"graph-error",children:[e.jsxs("span",{children:["⚠️ ",N]}),e.jsx("button",{onClick:h,children:"重试"})]}):!m||!g?null:e.jsx("div",{className:"graph-info",children:e.jsxs("div",{className:"graph-stats",children:[e.jsxs("span",{className:"stat-item",children:["🛣️ 路段: ",g.features.length]}),e.jsxs("span",{className:"stat-item",children:["📏 总距离: ",(g.total_distance/1e3).toFixed(1),"km"]}),e.jsxs("span",{className:"stat-item",children:["⏱️ 总时间: ",Math.round(g.total_duration/60),"min"]})]})})},C=({map:o,poiData:a,visible:m})=>{const g=i.useRef([]),j={医疗:{emoji:"🏥",color:"#ff4d4f"},教育:{emoji:"🏫",color:"#1890ff"},购物:{emoji:"🛒",color:"#52c41a"},养老:{emoji:"👴",color:"#722ed1"},文体:{emoji:"🏃",color:"#13c2c2"},餐饮:{emoji:"🍜",color:"#faad14"}},k=()=>{o&&g.current.length>0&&(g.current.forEach(c=>{try{o.removeOverlay(c)}catch{}}),g.current=[])},d=()=>{if(!o||!a||!m)return;k();const c=window.BMap;Object.entries(a).forEach(([l,v])=>{const h=j[l]||{emoji:"📍",color:"#666"};(v.facilities||[]).forEach(r=>{if(r.location){const x=new c.Point(r.location.lng,r.location.lat),u=new c.Icon(`data:image/svg+xml,${encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
                <circle cx="15" cy="15" r="14" fill="${h.color}" opacity="0.8"/>
                <text x="15" y="20" text-anchor="middle" font-size="16">${h.emoji}</text>
              </svg>
            `)}`,new c.Size(30,30),{anchor:new c.Size(15,15)}),w=new c.Marker(x,{icon:u});o.addOverlay(w),g.current.push(w),w.addEventListener("click",()=>{const y=new c.InfoWindow(`<div style="padding: 10px;">
                <h4 style="margin: 0 0 8px 0; color: ${h.color};">
                  ${h.emoji} ${r.name}
                </h4>
                <p style="margin: 4px 0;"><strong>类别：</strong>${l}</p>
                <p style="margin: 4px 0;"><strong>地址：</strong>${r.address||"暂无"}</p>
                ${r.distance?`<p style="margin: 4px 0;"><strong>距离：</strong>${r.distance}米</p>`:""}
                ${r.tag?`<p style="margin: 4px 0;"><strong>标签：</strong>${r.tag}</p>`:""}
              </div>`,{width:250,height:120,title:"设施详情"});o.openInfoWindow(y,x)})}})})};if(i.useEffect(()=>{d()},[a,m]),i.useEffect(()=>()=>{k()},[]),!m||!a)return null;const N=Object.entries(a).map(([c,l])=>({category:c,count:l.count||0,level:l.level||"匮乏"}));return e.jsxs("div",{className:"poi-info",children:[e.jsx("h4",{children:"📍 周边设施"}),e.jsx("div",{className:"poi-stats",children:N.map(({category:c,count:l,level:v})=>{const h=j[c]||{emoji:"📍"};return e.jsxs("div",{className:"poi-stat-item",children:[e.jsx("span",{className:"poi-icon",children:h.emoji}),e.jsx("span",{className:"poi-category",children:c}),e.jsxs("span",{className:"poi-count",children:[l,"个"]}),e.jsx("span",{className:`poi-level poi-level-${v}`,children:v})]},c)})})]})},E=({loading:o,message:a="加载中..."})=>o?e.jsx("div",{className:"loading-overlay",children:e.jsxs("div",{className:"loading-content",children:[e.jsxs("div",{className:"loading-spinner",children:[e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"}),e.jsx("div",{className:"spinner-circle"})]}),e.jsx("p",{className:"loading-message",children:a}),e.jsx("p",{className:"loading-submessage",children:"正在调用百度地图API计算等时圈..."})]})}):null,R=({center:o,isochrone:a,poiCoverage:m,loading:g=!1,onCenterChange:j})=>{const k=i.useRef(null),d=i.useRef(null),[N,c]=i.useState(!1),[l,v]=i.useState(!0),[h,b]=i.useState(!0),[r,x]=i.useState(!0),[u,w]=i.useState(!1);i.useEffect(()=>{if(k.current&&!d.current){const t=window.BMap;if(t){const n=new t.Map(k.current),s=new t.Point(118.7969,32.0603);n.centerAndZoom(s,14),n.enableScrollWheelZoom(),n.addControl(new t.NavigationControl),n.addControl(new t.ScaleControl),n.addControl(new t.OverviewMapControl),n.addEventListener("click",y),d.current=n,c(!0)}}return()=>{d.current&&d.current.clearOverlays()}},[]);const y=i.useCallback(t=>{if(!u)return;const n=window.BMap,s=d.current;if(!s||!n)return;const p=t.point;s.clearOverlays();const f=new n.Icon(`data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="12" fill="#ff4d4f" stroke="white" stroke-width="2"/>
          <text x="15" y="20" text-anchor="middle" fill="white" font-size="14">📍</text>
        </svg>
      `)}`,new n.Size(30,30),{anchor:new n.Size(15,15)}),M=new n.Marker(p,{icon:f});s.addOverlay(M);const $=new n.InfoWindow(`<div style="padding: 10px;">
        <h4 style="margin: 0 0 8px 0; color: #ff4d4f;">📍 选中的位置</h4>
        <p style="margin: 4px 0;"><strong>经度：</strong>${p.lng.toFixed(6)}</p>
        <p style="margin: 4px 0;"><strong>纬度：</strong>${p.lat.toFixed(6)}</p>
        <button onclick="window.confirmCenterSelection(${p.lng}, ${p.lat})" style="
          margin-top: 8px;
          padding: 6px 12px;
          background: #1890ff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        ">确认选择</button>
      </div>`,{width:220,height:120,title:"位置信息"});s.openInfoWindow($,p),window.confirmCenterSelection=(I,O)=>{j&&j(I,O),w(!1),s.closeInfoWindow()}},[u,j]);return i.useEffect(()=>{if(!d.current||!o)return;const t=d.current,n=window.BMap,s=new n.Point(o.lng,o.lat);t.centerAndZoom(s,15);const p=new n.Icon(`data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#1890ff" stroke="white" stroke-width="3"/>
          <circle cx="20" cy="20" r="8" fill="white"/>
        </svg>
      `)}`,new n.Size(40,40),{anchor:new n.Size(20,20)}),f=new n.Marker(s,{icon:p});t.addOverlay(f);const M=new n.InfoWindow(`<div style="padding: 10px;">
        <h4 style="margin: 0 0 8px 0; color: #1890ff;">📍 ${o.name}</h4>
        <p style="margin: 4px 0;"><strong>经度：</strong>${o.lng}</p>
        <p style="margin: 4px 0;"><strong>纬度：</strong>${o.lat}</p>
      </div>`,{width:200,height:80,title:"社区中心"});f.addEventListener("click",()=>{t.openInfoWindow(M,s)})},[o]),i.useEffect(()=>{if(!d.current||!a)return;const t=d.current,n=window.BMap;if(t.getOverlays().forEach(s=>{s instanceof n.Polygon&&t.removeOverlay(s)}),a.polygon&&a.polygon.geometry){const p=a.polygon.geometry.coordinates[0].map(M=>new n.Point(M[0],M[1])),f=new n.Polygon(p,{strokeColor:"#1890ff",strokeWeight:2,strokeOpacity:.8,fillColor:"#1890ff",fillOpacity:.2});t.addOverlay(f)}},[a]),e.jsxs("div",{className:"map-container",children:[e.jsx("div",{ref:k,className:"map-view"}),g&&e.jsx(E,{loading:!0}),e.jsxs("div",{className:"layer-controls",children:[e.jsx("h4",{children:"图层控制"}),e.jsxs("div",{className:"layer-buttons",children:[e.jsx("button",{className:`layer-button ${l?"active":""}`,onClick:()=>v(!l),children:"🛣️ Graph路网"}),e.jsx("button",{className:`layer-button ${h?"active":""}`,onClick:()=>b(!h),children:"📍 POI设施"}),e.jsx("button",{className:`layer-button ${r?"active":""}`,onClick:()=>x(!r),children:"⚠️ 盲区"}),e.jsx("button",{className:`layer-button ${u?"active":""}`,onClick:()=>w(!u),children:"🎯 点击选位"})]})]}),e.jsxs("div",{className:"map-legend",children:[e.jsx("h4",{children:"图例"}),e.jsxs("div",{className:"legend-items",children:[e.jsxs("div",{className:"legend-item",children:[e.jsx("span",{className:"legend-color",style:{backgroundColor:"#1890ff"}}),e.jsx("span",{children:"15分钟步行范围"})]}),e.jsxs("div",{className:"legend-item",children:[e.jsx("span",{className:"legend-color",style:{backgroundColor:"#52c41a"}}),e.jsx("span",{children:"POI设施"})]}),e.jsxs("div",{className:"legend-item",children:[e.jsx("span",{className:"legend-color",style:{backgroundColor:"#ff4d4f"}}),e.jsx("span",{children:"服务盲区"})]})]})]}),l&&N&&o&&e.jsx(S,{map:d.current,center:o,visible:l}),h&&N&&m&&e.jsx(C,{map:d.current,poiData:m,visible:h}),u&&e.jsx("div",{className:"click-mode-hint",children:e.jsx("span",{children:"🎯 点击地图选择位置"})})]})};export{R as default};
