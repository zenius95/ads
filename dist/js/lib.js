function getAccessTokenOne(){return new Promise((async(e,t)=>{const a=await fetch("https://business.facebook.com/accountquality/"),n=await a.text();let s=n.match(/(?<=\"accessToken\":\")[^\"]*/g),o=n.match(/(?<=\"USER_ID\":\")[^\"]*/g),c=n.match(/(?<=\"token\":\")[^\"]*/g);s=s.filter((e=>e.includes("EAA"))),c[0]&&c[1]&&s[0]&&o[0]?(localStorage.setItem("accessToken",s[0]),localStorage.setItem("fb_dtsg",c[0]),localStorage.setItem("lsd",c[1]),localStorage.setItem("fid",o[0]),e(s[0])):t("Can't get access token")}))}function getAccessTokenThree(){return new Promise((async(e,t)=>{const a=await fetch("https://business.facebook.com/content_management");let n=(await a.text()).match(/(?<=\"accessToken\":\")[^\"]*/g);n=n.filter((e=>e.includes("EAA"))),n[0]?e(n[0]):t("Can't get access token")}))}function getAccessTokenTwo(){return new Promise((async(e,t)=>{const a=await fetch("https://www.facebook.com/adsmanager/");let n=(await a.text()).match(/window.location\.replace\("(.+)"/);if(n){n=n[1].replace(/\\/g,"");const a=await fetch(n);let s=(await a.text()).match(/window.__accessToken="(.*)";/);s[1]?(localStorage.setItem("accessToken2",s[1]),e(s[1])):t("Can't get access token")}else t("Can't get access token")}))}function getAccessToken(){return new Promise((async(e,t)=>{try{const t=await getAccessTokenOne();await getAccessTokenTwo(),e(t)}catch(e){t(e)}}))}function getAdAccounts(e,t=50,a="",n=""){return new Promise((async(s,o)=>{let c="";a.length>0?c="&before="+a:n.length>0&&(c="&after="+n);const i=localStorage.getItem("fid"),r=await fetch("https://graph.facebook.com/v14.0/me/adaccounts?limit="+t+"&fields=name,account_id,account_status,userpermissions.user("+i+"){role}&access_token="+e+"&summary=1"+c+"&locale=en_US");s(await r.json())}))}function getAccountInfo(e,t){return new Promise((async(a,n)=>{const s=await fetch("https://graph.facebook.com/v14.0/act_"+t+"?access_token="+e+'&fields=["business_city","business_country_code","business_name","business_state","business_street","business_street2","business_zip","currency","id","is_personal","name","owner","tax_id","timezone_id","timezone_name","users{id,is_active,name,role,roles}"]'),o=await s.json();o.error?n(o.error.message):a(o)}))}function getAccountStats(e,t){return new Promise((async(a,n)=>{const s="https://graph.facebook.com/v14.0/act_"+e+"?fields=account_id,owner_business,created_time,next_bill_date,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,business_country_code,disable_reason,adspaymentcycle{threshold_amount},balance,owner,insights.date_preset(maximum){spend}&access_token="+t,o="https://graph.facebook.com/v14.0/act_"+e+"?fields=is_prepay_account&access_token="+t,c=await fetch(s),i=await c.json(),r={id:i.account_id,balance:i.balance,threshold:i.adspaymentcycle?i.adspaymentcycle.data[0].threshold_amount:"",spend:i.insights?i.insights.data[0].spend:"0",createdTime:i.created_time,nextBillDate:i.next_bill_date,timezoneName:i.timezone_name,limit:i.adtrust_dsl,currency:i.currency,disableReason:i.disable_reason,countryCode:i.business_country_code??"",ownerBusiness:i.owner_business?i.owner_business.id:null},m=await fetch(o),l=await m.json();l.error?r.prePay="":r.prePay=l.is_prepay_account?"TT":"TS",a(r)}))}function renameAdAccount(e,t,a){return new Promise((async(n,s)=>{const o=await fetch("https://graph.facebook.com/v14.0/act_"+e+"?name="+encodeURIComponent(t)+"&method=post&access_token="+a+"&locale=en_US");(await o.json()).success?n():s()}))}function removeAdAccount(e,t,a){return new Promise((async(n,s)=>{const o=await fetch("https://graph.facebook.com/v14.0/act_"+e+"/users/"+t+"?method=DELETE&access_token="+a+"&locale=vi_VN"),c=await o.json();c.error?s(c.error.message):n()}))}function removeBmAccount(e,t){return new Promise((async(a,n)=>{const s=await fetch("https://graph.facebook.com/v14.0/"+e+"?method=delete&access_token="+t),o=await s.json();o.error?n(o.error.message):a()}))}function addAdAccount(e,t,a,n){return new Promise((async(s,o)=>{const c=await fetch("https://graph.facebook.com/v14.0/act_"+e+"/users?method=POST&access_token="+a+"&role="+n+"&uid="+t+"&locale=vi_VN");(await c.json()).error?o():s()}))}function changeBillingInfo(e,t,a,n){return new Promise((async(s,o)=>{const c=new FormData,i={input:{billable_account_payment_legacy_account_id:e,currency:null,tax:n,timezone:null,client_mutation_id:"28"}};c.append("fb_dtsg",a),c.append("lsd",t),c.append("variables",JSON.stringify(i)),c.append("doc_id","5428097817221702"),c.append("locale","vi_VN");const r=await fetch("https://www.facebook.com/api/graphql/",{method:"POST",body:c}),m=await r.json();m.errors?o(m.errors[0].description):s(m)}))}function getAccountQuality(e){return new Promise((async(e,t)=>{const a=new FormData,n=localStorage.getItem("fb_dtsg"),s=localStorage.getItem("lsd"),o=localStorage.getItem("fid");a.append("fb_dtsg",n),a.append("lsd",s),a.append("variables",'{"assetOwnerId":"'+o+'"}'),a.append("doc_id","5816699831746699");const c=await fetch("https://www.facebook.com/api/graphql/",{method:"POST",body:a}),i=await c.json();if(!i.error){let t="";const a=i.data.assetOwnerData.advertising_restriction_info.restriction_type,n=i.data.assetOwnerData.advertising_restriction_info.status,s=i.data.assetOwnerData.advertising_restriction_info.additional_parameters?i.data.assetOwnerData.advertising_restriction_info.additional_parameters.ufac_state:null;t="RISK_REVIEW"===a?"Xác minh thẻ":"APPEAL_TIMEOUT"===n?"Cần kháng 273":"NOT_RESTRICTED"===n?"VIA BT":"PREHARM"===a&&"VANILLA_RETRICTION"===n?"XMDT":"PREHARM"===a&&"APPEAL_REJECTED_NO_RETRY"===n?"Hạn chế đỏ XMDT":"ALE"===a&&"APPEAL_REJECTED_NO_RETRY"===n?"Hạn chế vĩnh viễn":"ALE"===a&&"TIMEOUT"===s?"Hạn chế đỏ 902":"ALE"===a&&"VANILLA_RETRICTED"===n?"902":"ALE"===a&&"APPEAL_PENDING"===n?"Đang kháng 902":"ALE"===a&&"APPEAL_ACCEPTED"===n?"Tích 902":"PREHARM"===a&&"APPEAL_ACCEPTED"===n?"Tích XMDT":"PREHARM"===a&&"APPEAL_PENDING"===n?"Đang kháng XMDT":"Không xác định",e(t)}}))}function getBussinesses(e){return new Promise((async(t,a)=>{const n=await fetch("https://graph.facebook.com/v14.0/me/businesses?fields=name,id,verification_status,business_users,allow_page_management_in_www,sharing_eligibility_status,created_time,permitted_roles,client_ad_accounts.summary(1),owned_ad_accounts.summary(1)&limit=9999999&access_token="+e);t(await n.json())}))}function getBmLimit(e){return new Promise((async(t,a)=>{const n=localStorage.getItem("fb_dtsg"),s=localStorage.getItem("lsd"),o=await fetch("https://business.facebook.com/business/adaccount/limits/?business_id="+e+"&__a=1&fb_dtsg="+n+"&lsd="+s),c=await o.text(),i=JSON.parse(c.replace("for (;;);",""));i.payload?t(i.payload.adAccountLimit):a()}))}function getAccountUsers(e,t){return new Promise((async(a,n)=>{const s=await fetch("https://graph.facebook.com/v14.0/act_"+e+"/users?method=GET&access_token="+t),o=await s.json();o.data?a(o.data):n()}))}function getHiddenAccount(e){return new Promise((async(t,a)=>{try{const a=await fetch("https://www.facebook.com/ads/manager/account_settings/information/?act="+e),n=await a.text();t(n.match(/\b(\d+)\,(name:null)\b/g).map((e=>({id:e.replace(",name:null",""),name:"Người dùng Facebook"}))))}catch{t([])}}))}function checkBmHiddenAdmin(e,t,a){return new Promise((async(n,s)=>{const o=await fetch("https://graph.facebook.com/v14.0/"+e+"/business_users?access_token="+t+"&fields=email,+first_name,+last_name,+id,+pending_email,+role&limit=300"),c=await o.json(),i=await fetch("https://graph.facebook.com/v14.0/"+e+"/business_users?access_token="+a+"&fields=email,+first_name,+last_name,+id,+pending_email,+role&limit=300"),r=await i.json();if(c.error&&r.error)s(c.error.message);else if(c.data.length<r.data.length){const e=c.data.map((e=>e.email)),t=r.data.map((e=>e.email));let a=[];t.filter((t=>!e.includes(t))).forEach((e=>{const t=r.data.filter((t=>e==t.email));a.push(t[0])})),n(a)}else n([])}))}function searchTarget(e,t,a){return new Promise((async(n,s)=>{const o=await fetch("https://graph.facebook.com/v14.0/search?limit=1000000&locale="+a+"&q="+encodeURIComponent(t)+"&transport=cors&type=adinterest&access_token="+e);n(await o.json())}))}function getWebToken(){return new Promise(((e,t)=>{chrome.cookies.getAll({domain:"via.local"},(function(a){const n=a.filter((e=>"token"===e.name));n[0]?e(n[0].value):t()}))}))}function getDisableReason(e){return{0:"",1:"ADS_INTEGRITY_POLICY",2:"ADS_IP_REVIEW",3:"RISK_PAYMENT",4:"GRAY_ACCOUNT_SHUT_DOWN",5:"ADS_AFC_REVIEW",6:"BUSINESS_INTEGRITY_RAR",7:"PERMANENT_CLOSE",8:"UNUSED_RESELLER_ACCOUNT"}[e]}function formatNumber(e){const t=new Intl.NumberFormat("en-US",{maximumSignificantDigits:3});return e?t.format(e):0}function nano(e,t){return e.replace(/\{([\w\.]*)\}/g,(function(e,a){for(var n=a.split("."),s=t[n.shift()],o=0,c=n.length;o<c;o++)s=s[n[o]];return null!=s?s:""}))}function render(e,t={}){return new Promise(((a,n)=>{$.get("../templates/"+e+".html",(function(e){a(nano(e,t))}))}))}function renderLoop(e,t={}){return new Promise(((a,n)=>{$.get("../templates/"+e+".html",(function(e){let n="";for(let a=0;a<t.length;a++){n+=nano(e,t[a])}a(n)}))}))}function getFormData(e){const t=$(e).serializeArray();var a={};return t.forEach((e=>{a[e.name]=e.value??""})),a}function getRoleName(e){return{1001:"Quản trị viên",1002:"Nhà quảng cáo",1003:"Nhà phân tích"}[parseInt(e)]??""}function delay(e){return new Promise((t=>setTimeout(t,e)))}
