const accountTable={retrieve:!0,searching:!0,ordering:!0,info:!1,paging:!1,lengthChange:!1,order:[[1,"asc"]],columnDefs:[{orderable:!1,targets:0}],language:{emptyTable:"Không có dữ liệu"}},bmAccountTable={retrieve:!0,searching:!0,ordering:!0,info:!1,paging:!1,lengthChange:!1,order:[[1,"asc"]],columnDefs:[{orderable:!1,targets:0}],language:{emptyTable:"Không có dữ liệu"}},notyf=new Notyf({position:{x:"right",y:"bottom"},duration:2e3,dismissible:!0}),appLoading={message:'<div class="d-flex align-items-center"><span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang tải dữ liệu, vui lòng chờ...</div>',icon:"",position:{x:"right",y:"bottom"},background:"#ffc107",duration:1e8,dismissible:!1},savedTargets=new localStorageDB("savedTargets",localStorage),cache=new localStorageDB("cache",localStorage);async function accountLoading(){const t=await render("accountLoading");$("#accounts .table").DataTable().destroy(),$("#accounts tbody").empty().html(t)}async function bmAccountLoading(){const t=await render("bmAccountLoading");$("#bmAccounts .table").DataTable().destroy(),$("#bmAccounts tbody").empty().html(t)}async function adsLoading(){const t=await render("adsLoading");$("#adsTable tbody").empty().html(t)}async function loadAccounts(t,e="",a=""){new PerfectScrollbar("#accounts");const n=localStorage.getItem("accessToken"),s=await getAdAccounts(n,t,e,a);notyf.dismissAll();const o=Math.ceil(s.summary.total_count/t);s.paging.next&&$("#account-next").attr("data-next",s.paging.cursors.after),s.paging.previous&&$("#account-prev").attr("data-prev",s.paging.cursors.before),$("#account-page-max").text(o);const c=[];for(let t=0;t<s.data.length;t++){const e=s.data[t];e.role=e.userpermissions?e.userpermissions.data[0].role:"",c.push({account_id:e.account_id,name:e.name,role:e.role,account_status:e.account_status})}const d=await renderLoop("account",c);$("#accounts tbody").html(d),$("#accounts tbody tr").each((async function(){const t=$(this).attr("data-id");let e={};const a=cache.queryAll("adAccount",{query:{account_id:t}});if(0===a.length){e=await getAccountStats(t,n),e.createdTime=moment(e.createdTime).format("DD/MM/YYYY"),e.nextBillDate=moment(e.nextBillDate).format("DD/MM/YYYY");const a=moment(e.nextBillDate,"DD/MM/YYYY"),s=moment(moment().format("DD/MM/YYYY"),"DD/MM/YYYY");e.dayRemain=moment.duration(a.diff(s)).asDays(),e.remain=parseInt(e.threshold)-parseInt(e.balance),e.disableReason=getDisableReason(e.disableReason),e.accountType=null!==e.ownerBusiness?"Bussiness":"Cá nhân",e.limit=-1!=e.limit?e.limit:0,e.account_id=t,cache.insert("adAccount",e),cache.commit()}else e=a[0];"USD"===e.currency&&(e.balance=e.balance/100,e.threshold=e.threshold/100,e.remain=e.remain/100),e.id="act_"+e.account_id,$(this).find('td[data-id="balance"]').html(formatNumber(e.balance)).removeClass("row-loading").attr("data-raw",e.balance).attr("data-currency",e.currency),$(this).find('td[data-id="threshold"]').html(`\n            <a class="text-dark" href="https://adsmanager.facebook.com/ads/manager/account_settings/account_billing/?act=${e.account_id}" target="_BLANK">${formatNumber(e.threshold)}</a>\n        `).removeClass("row-loading").attr("data-raw",e.threshold).attr("data-currency",e.currency),$(this).find('td[data-id="remain"]').html(formatNumber(e.remain)).removeClass("row-loading").attr("data-raw",e.remain).attr("data-currency",e.currency),$(this).find('td[data-id="limit"]').html(e.limit>0?formatNumber(e.limit):"No Limit").removeClass("row-loading").attr("data-raw",e.limit).attr("data-currency",e.currency),$(this).find('td[data-id="spend"]').html(formatNumber(e.spend)).removeClass("row-loading").attr("data-raw",e.spend).attr("data-currency",e.currency),$(this).find('td[data-id="currency"]').html(e.currency+"/"+e.prePay).removeClass("row-loading"),$(this).find('td[data-id="accountType"]').html(e.accountType).removeClass("row-loading"),$(this).find('td[data-id="hiddenUsers"]').html(e.hiddenUsers).removeClass("row-loading"),$(this).find('td[data-id="disableReason"]').html(e.disableReason).removeClass("row-loading"),$(this).find('td[data-id="createdTime"]').html(e.createdTime).removeClass("row-loading"),$(this).find('td[data-id="nextBillDate"]').html(e.nextBillDate).removeClass("row-loading"),$(this).find('td[data-id="dayRemain"]').html(e.dayRemain).removeClass("row-loading"),$(this).find('td[data-id="countryCode"]').html(e.countryCode).removeClass("row-loading"),$(this).find('td[data-id="ownerBusiness"]').html(e.ownerBusiness).removeClass("row-loading"),$(this).find('td[data-id="timezoneName"]').html(e.timezoneName).removeClass("row-loading")})),updateCurrency()}async function updateCurrency(){const t=localStorage.getItem("account-currency"),e=JSON.parse(localStorage.getItem("rates"))[t];$('td[data-raw]:not([data-currency="'+t+'"])').each((function(){const t=$(this).attr("data-currency"),a=$(this).attr("data-raw"),n=e[t];$(this).text(formatNumber((a/n).toFixed(2)))}))}async function loadBmAccounts(){bmAccountLoading();const t=notyf.success(appLoading);new PerfectScrollbar("#bmAccounts");const e=localStorage.getItem("accessToken"),a=await getBussinesses(e);notyf.dismiss(t);const n=[];for(let t=0;t<a.data.length;t++){const e=a.data[t];e.role=e.permitted_roles[0],e.verify=e.verification_status.replace("_"," ").toUpperCase(),e.numAccount=e.owned_ad_accounts.data.length+e.client_ad_accounts.data.length,e.numAdmin=e.business_users.data.length,e.status=e.allow_page_management_in_www?1:2,e.createdTime=moment(e.created_time).format("DD/MM/YYYY"),n.push(e)}const s=await renderLoop("bmAccount",n);$("#bmAccounts tbody").html(s),$("#bmAccounts tbody tr").each((async function(){const t=$(this).attr("data-id");let e="";const a=cache.queryAll("bmAccount",{query:{account_id:t}});if(0===a.length){try{e=await getBmLimit(t)}catch{e=""}cache.insert("bmAccount",{account_id:t,limit:e}),cache.commit()}else e=a[0].limit;$(this).find('td[data-id="bmType"]').html('<span class="badge text-bg-info">BM'+e+"</span>").removeClass("row-loading")}))}async function loadAds(t){$("#adTypeTab button").removeClass("active"),$('#adTypeTab button[data-type="all"]').addClass("active"),adsLoading();const e=localStorage.getItem("accessToken"),a=await fetch("https://graph.facebook.com/v14.0/act_"+t+"/adimages?limit=100&fields=name,url_128,ads_integrity_review_info,creatives&access_token="+e),n=await fetch("https://graph.facebook.com/v14.0/act_"+t+"/advideos?limit=100&fields=id,picture,creatives,ads_integrity_review_info&access_token="+e),s=await a.json(),o=await n.json(),c=s.data.concat(o.data);let d="";c.forEach((t=>{d+=`\n            <tr data-id="${t.id}" data-type="${"VIDEO"===t.ads_integrity_review_info.comp_type?"video":"image"}">\n                <td class="text-center">${"VIDEO"===t.ads_integrity_review_info.comp_type?"VIDEO":"IMAGE"}</td>\n                <td class="text-center"><img src="${t.picture??t.url_128}" style="height:50px;width:50px;object-fit:cover;"></td>\n                <td class="text-center">${t.creatives?t.creatives.length:"-"}</td>\n                <td class="text-center">${t.ads_integrity_review_info.is_reviewed?'<i class="ri-checkbox-circle-fill fs-5 fw-normal text-success"></i>':'<i class="ri-close-circle-fill fs-5 fw-normal text-danger"></i>'}\n                </td>\n                <td class="text-center">${t.ads_integrity_review_info.is_human_reviewed?'<i class="ri-checkbox-circle-fill fs-5 fw-normal text-success"></i>':'<i class="ri-close-circle-fill fs-5 fw-normal text-danger"></i>'}\n                </td>\n\n            </tr>\n        `})),$("#adsTable tbody").empty().html(d),new PerfectScrollbar("#adsTable")}savedTargets.isNew()&&(savedTargets.createTable("data",["target"]),savedTargets.commit()),cache.isNew()&&(cache.createTable("adAccount",["account_id","createdTime","nextBillDate","dayRemain","remain","currency","disableReason","accountType","balance","threshold","limit","spend","countryCode","ownerBusiness","timezoneName","prePay"]),cache.createTable("bmAccount",["account_id","limit"]),cache.commit()),$("body").on("click",".selectable",(async function(){const t=$(this).attr("data-target"),e=$(this).attr("data-value"),a=$(this).text();$("#"+t).text(a),$("#"+t).attr("data-value",e),localStorage.setItem(t,e),"account-limit"===t&&(accountLoading(),loadAccounts(e)),"account-currency"===t&&location.reload()})),$("body").on("click","#account-next",(async function(){const t=$("#account-limit").attr("data-value"),e=$(this).attr("data-next"),a=parseInt($("#account-page").text());e.length>0&&($(this).attr("data-next",""),$("#account-page").text(a+1),accountLoading(),loadAccounts(t,"",e))})),$("body").on("click","#account-prev",(async function(){const t=$("#account-limit").attr("data-value"),e=$(this).attr("data-prev"),a=parseInt($("#account-page").text());e.length>0&&($(this).attr("data-prev",""),$("#account-page").text(a-1),accountLoading(),loadAccounts(t,e))})),$("body").on("keyup","#account-search",(async function(){const t=$(this).val();$("#tab-accounts").hasClass("active")?$("#accounts .table").DataTable().search(t).draw():$("#bmAccounts .table").DataTable().search(t).draw()})),$("body").on("click","#selectAllAccount",(async function(){$(this).is(":checked")?$("#accounts .form-check-input[data-check]").each((function(){$(this).prop("checked",!0)})):$("#accounts .form-check-input[data-check]").each((function(){$(this).prop("checked",!1)}))})),$("body").on("click","#selectAllBm",(async function(){$(this).is(":checked")?$("#bmAccounts .form-check-input[data-check]").each((function(){$(this).prop("checked",!0)})):$("#bmAccounts .form-check-input[data-check]").each((function(){$(this).prop("checked",!1)}))})),$("body").on("click","#checkBmHiddenAdminButton",(async function(){if(0===$("#hiddenAdminModal").length){const t=await render("hiddenAdminModal");$("body").append(t)}$("#hiddenAdminModal").modal("show");const t=$(this).attr("data-id"),e=localStorage.getItem("accessToken"),a=localStorage.getItem("accessToken2"),n=await checkBmHiddenAdmin(t,e,a),s=await renderLoop("accountUsers",n.map((t=>(t.name=t.first_name+" "+t.last_name+" ("+t.role+")",t.role=t.email,t))));$("#hiddenBmAdmins").html(s),document.getElementById("hiddenAdminModal").addEventListener("hidden.bs.modal",(t=>{$("#hiddenAdminModal").remove()}))})),$("body").on("click","#changeInfoButton",(async function(){if(0===$("#changeAccountModal").length){const t=await render("accountModal");$("body").append(t)}const t=notyf.success(appLoading),e=$(this).attr("data-id"),a=localStorage.getItem("accessToken"),n=await getAccountInfo(a,e);$('#changeAccountModal input[type="hidden"][name="account_id"]').val(e),$('#changeAccountModal input[name="name"]').val(n.name),$('#changeAccountModal input[name="bussiness_name"]').val(n.business_name),$('#changeAccountModal input[name="bussiness_street_1"]').val(n.business_street),$('#changeAccountModal input[name="bussiness_street_2"]').val(n.business_street2),$('#changeAccountModal input[name="bussiness_city"]').val(n.bussiness_city),$('#changeAccountModal input[name="bussiness_tax"]').val(n.tax_id),0===n.is_personal?$('#changeAccountModal input[name="is_persional_use"][value="0"]').prop("checked",!0):$('#changeAccountModal input[name="is_persional_use"][value="1"]').prop("checked",!0),$('#changeAccountModal select[name="currency"] option[value="'+n.currency+'"]').prop("selected",!0),$('#changeAccountModal select[name="bussiness_country"] option[value="'+n.business_country_code+'"]').prop("selected",!0),$('#changeAccountModal select[name="timezone"] option:first-child').text(n.timezone_name),$("#accountUsers"),notyf.dismiss(t),$("#changeAccountModal").modal("show"),document.getElementById("infoTabNav").addEventListener("shown.bs.tab",(async t=>{if("#edit-role"==t.target.getAttribute("data-bs-target")&&!$("#accountUsers").hasClass("loaded")){$("#accountUsers").addClass("loaded");const t=localStorage.getItem("accessToken2"),e=$('#changeAccountModal input[type="hidden"][name="account_id"]').val(),a=(await getAccountUsers(e,t)).map((t=>(t.role=getRoleName(t.role),t)));$("#accountUsers").html(await renderLoop("accountUsers",a));try{const t=await getHiddenAccount(e);t.length>0&&($("#edit-role label.d-none").removeClass("d-none"),$("#hiddenUsers").html(await renderLoop("accountUsers",t)))}catch{}}})),document.getElementById("changeAccountModal").addEventListener("hidden.bs.modal",(t=>{$("#changeAccountModal").remove()}))})),$("body").on("click","#changeAccountModal .removeAccount",(async function(){const t=$(this).attr("data-id"),e=$('input[type="hidden"][name="account_id"]').val(),a=localStorage.getItem("accessToken2");try{await removeAdAccount(e,t,a),$('div[data-account="'+t+'"]').fadeOut(400),notyf.success({message:"Xóa thành công!"})}catch(t){notyf.error({message:"Không thể xóa tài khoản!"})}})),$("body").on("click","#savedTargetButton",(async function(){if(0===$("#savedTargetModal").length){const t=await render("savedTargetModal");$("body").append(t)}const t=savedTargets.queryAll("data");let e="";t.forEach((t=>{e+=`\n        <tr>\n            <td><strong>${t.target}</strong></td>\n            <td>\n                <button class="btn btn-sm border-0"><i class="ri-file-copy-2-fill text-primary fs-6"></i></button>\n                <button class="btn btn-sm border-0"><i class="ri-delete-bin-fill text-danger fs-6"></i></button>\n            </td>\n        </tr>\n        `})),$("#savedTargetModal tbody").html(e),$("#savedTargetModal").modal("show"),document.getElementById("savedTargetModal").addEventListener("hidden.bs.modal",(t=>{$("#savedTargetModal").remove()}))})),$("body").on("click","#hiddenAdminModal .removeAccount",(async function(){const t=$(this).attr("data-id"),e=localStorage.getItem("accessToken2");try{await removeBmAccount(t,e),$('div[data-account="'+t+'"]').fadeOut(400),notyf.success({message:"Xóa thành công!"})}catch(t){notyf.error({message:"Không thể xóa tài khoản!"})}})),$("body").on("click","#saveBussinessInfo",(async function(){$(this).prop("disabled",!0);var t=getFormData("#changeBussinessInfo");const e={business_address:{city:t.bussiness_city,country_code:t.bussiness_country,state:t.bussiness_state,street1:t.bussiness_street_1,street2:t.bussiness_street_2,zip:t.bussiness_zip},business_name:t.bussiness_name,is_personal_use:"1"===t.is_persional_use,tax_id:t.bussiness_tax};try{const a=localStorage.getItem("lsd"),n=localStorage.getItem("fb_dtsg");await changeBillingInfo(t.account_id,a,n,e),$(this).prop("disabled",!1),$("#changeAccountModal").modal("hide"),notyf.success({message:"Đổi thông tin doanh nghiệp thành công!"})}catch(t){$(this).prop("disabled",!1),notyf.error({message:t})}})),$("body").on("click","#saveAccountInfo",(async function(){$(this).prop("disabled",!0);const t=localStorage.getItem("accessToken");var e=getFormData("#changeAccountInfo");if(e.name.length>0)try{await renameAdAccount(e.account_id,e.name,t),$("#changeAccountModal").modal("hide"),$(this).prop("disabled",!1),notyf.success({message:"Đổi thông tin tài khoản thành công!"})}catch(t){$(this).prop("disabled",!1),notyf.error({message:"Không thể đổi thông tin tài khoản!"})}else $(this).prop("disabled",!1),notyf.error({message:"Xin mời nhập tên!"})})),$("body").on("click","#addAccountButton",(async function(){$(this).prop("disabled",!0);var t=getFormData("#addAccount");if(t.uid.length>0){const e=$('input[type="hidden"][name="account_id"]').val(),a=localStorage.getItem("accessToken2");try{await addAdAccount(e,t.uid,a,t.role);const n=await fetch("https://graph.facebook.com/v14.0/act_"+e+"/users?method=GET&access_token="+a),s=await n.json();if(s.data){const t=[];for(let e=0;e<s.data.length;e++){const a=s.data[e];a.role=getRoleName(a.role),t.push(a)}const e=await renderLoop("accountUsers",t);$("#accountUsers").html(e),$(this).prop("disabled",!1)}else notyf.error({message:"Không thể lấy danh sách tài khoản!"})}catch(t){$(this).prop("disabled",!1),notyf.error({message:"Không thể thêm tài khoản!"})}}else $(this).prop("disabled",!1),notyf.error({message:"Xin mời nhập ID cần thêm!"})})),$("body").on("change","#adAccountSelect",(function(){loadAds($(this).find("option:selected").val())})),$("body").on("click","#bulkHiddenAdmin",(async function(){if(0===$("#bulkHiddenAdminModal").length){const t=await render("bulkHiddenAdminModal");$("body").append(t)}const t=[];let e="#accounts";if($("#tab-bm-accounts").hasClass("show")&&(e="#bmAccounts"),$(e).find("td .form-check-input").each((function(){$(this).is(":checked")&&t.push($(this).attr("data-check"))})),t.length>0){$("#bulkHiddenAdminModal").modal("show"),new PerfectScrollbar("#hiddenAdminsTable");const a=localStorage.getItem("accessToken"),n=localStorage.getItem("accessToken2");for(let s=0;s<t.length;s++){const o=t[s];let c=[];try{c="#bmAccounts"==e?await checkBmHiddenAdmin(o,a,n):await getHiddenAccount(o)}catch(t){notyf.error({message:t});break}if(c.length>0){const t=c.map((t=>t.id));t.push("98987987987987987");const a=$(e).find('tr[data-id="'+o+'"] td[data-id="name"] strong').text(),n=$(e).find('tr[data-id="'+o+'"] td[data-id="status"]').attr("data-order");let s="";switch(n){case"1":s='<span class="text-success">Hoạt động</span>';break;case"2":s='<span class="text-danger">Vô hiệu hóa</span>';break;default:s='<span class="text-warning">Cần thanh toán</span>'}let d="";c.forEach((t=>{d+="#bmAccounts"==e?`\n                            <li>\n                                <strong style="font-size: 12px" class="d-block">${t.first_name} ${t.last_name} (${t.role})</strong>\n                                <span class="fw-normal" style="font-size: 12px">${t.id}</span>\n                            </li>\n                        `:`\n                            <li>\n                                <strong style="font-size: 12px" class="d-block">${t.name}</strong>\n                                <span class="fw-normal" style="font-size: 12px">${t.id}</span>\n                            </li>\n                        `}));const i=`\n                    <tr data-id="${o}">\n                        <td>\n                            <strong class="d-block">${a}</strong>\n                            <span class="fw-medium">${o}</span>\n                        </td>\n                        <td data-order="${n}">${s}</td>\n                        <td data-order="${t.length}" style="100px">\n                            <ul style="list-style: disc">\n                                ${d}\n                            </ul>\n                        </td>\n                        <td class="text-center" data-users="${t.join(",")}"></td>\n                    </tr>\n                `;$("#hiddenAdminsTable tbody").append(i)}}$("#hiddenAdminsTable table").DataTable({searching:!0,ordering:!0,info:!1,paging:!1,lengthChange:!1,language:{emptyTable:"Không tìm thấy Admin ẩn"}}),$("#deleteAllHiddenAdmin").prop("disabled",!1).find("span:not(.spinner-border)").text("Xóa Admin ẩn")}else notyf.error({message:"Xin mời chọn ít nhất 1 tài khoản"});document.getElementById("bulkHiddenAdminModal").addEventListener("hidden.bs.modal",(t=>{$("#bulkHiddenAdminModal").remove()}))})),$("body").on("click","#bulkChangeInfo",(async function(){if(0===$("#bulkChangeInfoModal").length){const t=await render("bulkChangeInfoModal");$("body").append(t)}const t=[];if($("#accounts").find("td .form-check-input").each((function(){$(this).is(":checked")&&t.push($(this).attr("data-check"))})),t.length>0){$("#bulkChangeInfoModal").modal("show");localStorage.getItem("accessToken"),localStorage.getItem("accessToken2");for(let e=0;e<t.length;e++){t[e]}}else notyf.error({message:"Xin mời chọn ít nhất 1 tài khoản"});document.getElementById("bulkChangeInfoModal").addEventListener("hidden.bs.modal",(t=>{$("#bulkChangeInfoModal").remove()})),document.getElementById("bulkChangeInfoProgress").addEventListener("hidden.bs.modal",(t=>{$("#bulkChangeInfoProgress").remove()}))})),$("body").on("click","#bulkChangeInfoButton",(async function(){const t=getFormData("#bulkChangeInfoForm"),e="1"==t.changeInfo,a="1"==t.shareRole,n=(localStorage.getItem("accessToken"),localStorage.getItem("accessToken2")),s=localStorage.getItem("lsd"),o=localStorage.getItem("fb_dtsg"),c=[];let d="";if(new PerfectScrollbar("#bulkChangeInfoProgressTable"),a&&0===t.uids.length)notyf.error({message:"Xin mời nhập UID"});else if($("#accounts").find("td .form-check-input").each((function(){if($(this).is(":checked")){const t=$(this).attr("data-check"),e=$("#accounts").find('tr[data-id="'+t+'"] td[data-id="name"] strong').text(),a=$("#accounts").find('tr[data-id="'+t+'"] td[data-id="status"]').attr("data-order");let n="";switch(a){case"1":n='<span class="text-success">Hoạt động</span>';break;case"2":n='<span class="text-danger">Vô hiệu hóa</span>';break;default:n='<span class="text-warning">Cần thanh toán</span>'}d+=`\n                <tr data-id="${t}">\n                    <td>\n                        <strong class="d-block">${e}</strong>\n                        <span class="fw-medium">${t}</span>\n                    </td>\n                    <td data-order="${a}">${n}</td>\n                    <td data-id="result">\n                        <ul style="width: 270px">\n                            <li class="bulkProgress changeInfoProgress d-none align-items-center">\n                                <div class="spinner-border spinner-border-sm text-secondary m-0 me-1" role="status" style="width:10px;height:10px"></div>\n                                <i class="text-success fw-normal ri-checkbox-circle-fill me-1"></i>\n                                <i class="text-danger fw-normal ri-close-circle-fill me-1"></i>\n                                <strong></strong>\n                            </li>\n                            <li class="bulkProgress shareRoleProgress d-none align-items-center">\n                                <div class="spinner-border spinner-border-sm text-secondary m-0 me-1" role="status" style="width:10px;height:10px"></div>\n                                <i class="text-success fw-normal ri-checkbox-circle-fill me-1"></i>\n                                <i class="text-danger fw-normal ri-close-circle-fill me-1"></i>\n                                <strong></strong>\n                            </li>\n                        </ul>\n                    </td>\n                </tr>\n                `,c.push(t)}})),e||a){$("#bulkChangeInfoModal").modal("hide"),$("#bulkChangeInfoProgressTable tbody").html(d),$("#bulkChangeInfoProgress").modal("show");for(let d=0;d<c.length;d++){const i=c[d],r=$('#bulkChangeInfoProgressTable tr[data-id="'+i+'"]');if(e){r.find('td[data-id="result"] .changeInfoProgress').removeClass("d-none").addClass("d-flex").find("strong").text("Đang đổi thông tin doanh nghiệp...");const e={business_address:{city:t.bussiness_city,country_code:t.bussiness_country,state:t.bussiness_state,street1:t.bussiness_street_1,street2:t.bussiness_street_2,zip:t.bussiness_zip},business_name:t.bussiness_name,is_personal_use:"1"===t.is_persional_use,tax_id:t.bussiness_tax};try{await changeBillingInfo(i,s,o,e),r.find('td[data-id="result"] .changeInfoProgress').addClass("success").find("strong").text("Đổi thông tin doanh nghiệp thành công")}catch(t){r.find('td[data-id="result"] .changeInfoProgress').addClass("error").find("strong").text("Đổi thông tin doanh nghiệp thất bại")}}if(a){const e=t.uids.split(/\r?\n|\r|\n/g);r.find('td[data-id="result"] .shareRoleProgress').removeClass("d-none").addClass("d-flex").find("strong").text("Đang share tài khoản...");let a=0;for(let s=0;s<e.length;s++){const o=e[s];try{await addAdAccount(i,o,n,t.role),a++}catch{}await delay(2e3)}r.find('td[data-id="result"] .shareRoleProgress').addClass(a<e.length?"error":"success").find("strong").text("Đã share "+a+"/"+e.length+" tài khoản")}await delay(2e3)}$("#bulkChangeInfoProgress .modal-footer button").prop("disabled",!1).find("span").text("Đóng")}else notyf.error({message:"Xin mời chọn 1 tác vụ"})})),$("body").on("click","#deleteAllHiddenAdmin",(async function(){const t=localStorage.getItem("accessToken2");if(!$(this).is(":disabled")){$(this).prop("disabled",!0).find("span:not(.spinner-border)").text("Đang xóa Admin ẩn...");for(let e=0;e<$("#hiddenAdminsTable tbody tr").length;e++){const a=$("#hiddenAdminsTable tbody tr")[e],n=$(a).attr("data-id"),s=$(a).find("[data-users]").attr("data-users").split(",");$(a).find("[data-users]").html('<div class="spinner-border spinner-border-sm text-secondary" role="status"></div>');let o=0;for(let e=0;e<s.length;e++){const c=s[e];try{$("#tab-bm-accounts").hasClass("show")?await removeBmAccount(c,t):await removeAdAccount(n,c,t),o++}catch{}$(a).find("[data-users]").html("Đã xóa: "+o+"/"+s.length)}}$(this).prop("disabled",!1).find("span:not(.spinner-border)").text("Xóa Admin ẩn")}})),$("body").on("click","#refreshData",(function(){localStorage.removeItem("accessToken"),localStorage.removeItem("accessToken2"),localStorage.removeItem("lsd"),localStorage.removeItem("fb_dtsg"),localStorage.removeItem("status"),localStorage.removeItem("db_cache"),location.reload()})),$("body").on("submit","#superTargetForm",(async function(t){t.preventDefault();const e=getFormData("#superTargetForm"),a=localStorage.getItem("accessToken2");if(e.search.length>0){$(".intro").remove(),$("#superTargetTable tbody").html(await render("targetLoading"));const t=await searchTarget(a,e.search,e.locale);if(!t.error){let e="";t.data.forEach((t=>{const a=savedTargets.queryAll("data",{query:{target:t.name}}).length>0?"saved btn-success":"bg-white border";e+=`\n                    <tr>\n                        <td>${t.name}</td>\n                        <td>${t.topic??""}</td>\n                        <td>${t.audience_size}</td>\n                        <td>\n                            <div class="d-flex">\n                                <button type="button" class="btn bg-white border shadow-sm btn-sm rounded-circle me-1">\n                                    <i class="ri-file-copy-2-fill fw-normal"></i>\n                                </button>\n                                <button type="button" data-target="${t.name}" class="saveTarget btn ${a} shadow-sm btn-sm rounded-circle">\n                                    <i class="ri-bookmark-fill fw-normal"></i>\n                                </button>\n                            </div>\n                        </td>\n                    </tr>\n                `})),$("#superTargetTable tbody").html(e)}}else notyf.error({message:"Xin vui lòng nhập từ khóa!"})})),$("body").on("click",".saveTarget",(function(){const t=$(this).attr("data-target");0===savedTargets.queryAll("data",{query:{target:t}}).length?(savedTargets.insert("data",{target:t}),$(this).removeClass("bg-white").removeClass("border").addClass("saved").addClass("btn-success"),notyf.success({message:"Đã lưu!"})):(savedTargets.deleteRows("data",{target:t}),$(this).removeClass("btn-success").removeClass("saved").addClass("border").addClass("bg-white"),notyf.success({message:"Đã xóa!"})),savedTargets.commit()})),document.getElementById("adTypeTab").addEventListener("shown.bs.tab",(t=>{const e=t.target.getAttribute("data-type");"all"===e?$("#adsTable tbody tr").css("display","table-row"):($("#adsTable tbody tr").css("display","none"),$('#adsTable tbody tr[data-type="'+e+'"]').css("display","table-row"))})),document.getElementById("accountTabs").addEventListener("shown.bs.tab",(t=>{"#tab-bm-accounts"==t.target.getAttribute("data-bs-target")?($("#bmAccounts").hasClass("loaded")||($("#bmAccounts").addClass("loaded"),loadBmAccounts()),$("#bulkChangeInfo").removeClass("d-flex").addClass("d-none")):$("#bulkChangeInfo").removeClass("d-none").addClass("d-flex"),$("#accounts .table").DataTable().draw(),$("#bmAccounts .table").DataTable().draw(),$("#account-search").val("")})),document.getElementById("menu-tabs").addEventListener("shown.bs.tab",(async t=>{if("#tab-ads-review"==t.target.getAttribute("data-bs-target")&&!$("#tab-ads-review").hasClass("loaded")){$("#adsTable tbody").html(await render("adsLoading"));const t=localStorage.getItem("accessToken"),e=await fetch("https://graph.facebook.com/v14.0/me/adaccounts?fields=name,account_id&access_token="+t+"&limit=9999&locale=en_US"),a=await e.json();if(a.data){let t="";a.data.forEach(((e,a)=>{t+=`<option value="${e.account_id}">${e.name}</option>`})),$("#adAccountSelect").html(t),loadAds(a.data[0].account_id)}$("#tab-ads-review").addClass("loaded")}"#tab-target"==t.target.getAttribute("data-bs-target")&&$("#savedCount").html(savedTargets.rowCount("data"))})),$(document).ready((async function(){notyf.success(appLoading);const t=localStorage.getItem("account-limit")??$("#account-limit").attr("data-value"),e=localStorage.getItem("account-currency")??$("#account-currency").attr("data-value");localStorage.getItem("account-limit")&&($("#account-limit").attr("data-value",t),$("#account-limit").text(99999999==t?"Max":t)),localStorage.getItem("account-currency")&&($("#account-currency").attr("data-value",e),$("#account-currency").text(e));const a=await fetch("https://raw.githubusercontent.com/zenius95/ads/main/rates.json"),n=await a.text();localStorage.setItem("rates",n),accountLoading();let s="";s=localStorage.getItem("accessToken")&&localStorage.getItem("lsd")&&localStorage.getItem("fb_dtsg")&&localStorage.getItem("accessToken2")&&localStorage.getItem("fid")?localStorage.getItem("accessToken"):await getAccessToken();try{const e=await fetch("https://graph.facebook.com/v14.0/me?access_token="+s);(await e.json()).error?(localStorage.removeItem("accessToken"),localStorage.removeItem("accessToken2"),localStorage.removeItem("lsd"),localStorage.removeItem("fb_dtsg"),localStorage.removeItem("fid"),notyf.error({message:"Đã xảy ra lỗi, vui lòng thử tải lại Extension",duration:9999999999999,dismissible:!1})):(loadAccounts(t),$("button:disabled").prop("disabled",!1),$("#account-search").prop("disabled",!1))}catch{localStorage.removeItem("accessToken"),localStorage.removeItem("accessToken2"),localStorage.removeItem("lsd"),localStorage.removeItem("fb_dtsg"),localStorage.removeItem("fid"),notyf.error({message:"Đã xảy ra lỗi, vui lòng thử tải lại Extension",duration:9999999999999,dismissible:!1})}let o="";localStorage.getItem("status")?o=localStorage.getItem("status"):(o=await getAccountQuality(),localStorage.setItem("status",o));const c=localStorage.getItem("fid");$("#accountStatus").text(o),$("#fbAvatar img").attr("src","https://graph.facebook.com/"+c+"/picture?access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662"),setInterval((function(){0===$("#accounts .table td.row-loading").length&&$("#accounts .table").DataTable(accountTable),0===$("#bmAccounts .table td.row-loading").length&&$("#bmAccounts .table").DataTable(bmAccountTable)}),500)}));
