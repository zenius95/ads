$(document).ready((async function(){const e=new Proxy(new URLSearchParams(window.location.search),{get:(e,t)=>e.get(t)}).id,t=localStorage.getItem("accessToken"),a="https://graph.facebook.com/v14.0/act_"+e+"?fields=account_id,account_status,userpermissions.user("+localStorage.getItem("fid")+"),owner_business,created_time,next_bill_date,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,business_country_code,disable_reason,adspaymentcycle{threshold_amount},balance,owner,insights.date_preset(maximum){spend}&access_token="+t,n=await fetch(a),s=await n.json(),c={id:s.account_id,balance:s.balance,threshold:s.adspaymentcycle?s.adspaymentcycle.data[0].threshold_amount:"",spend:s.insights?s.insights.data[0].spend:"0",createdTime:s.created_time,nextBillDate:s.next_bill_date,timezoneName:s.timezone_name,limit:s.adtrust_dsl,currency:s.currency,disableReason:s.disable_reason,countryCode:s.business_country_code??"",role:s.userpermissions?s.userpermissions.data[0].role:"",ownerBusiness:s.owner_business?s.owner_business.id:null};c.createdTime=moment(c.createdTime).format("DD/MM/YYYY"),c.nextBillDate=moment(c.nextBillDate).format("DD/MM/YYYY"),c.accountType=null!==c.ownerBusiness?"Bussiness":"Cá nhân",c.hiddenAdmin=await getHiddenAccount(e);let r="";switch(s.status){case"1":r='<span class="badge text-bg-success">Hoạt động</span>';break;case"2":r='<span class="badge text-bg-danger">Vô hiệu hóa</span>';break;default:r='<span class="badge text-bg-warning">Cần thanh toán</span>'}$("#status").html(r),$("#limit").html(formatNumber(c.adtrust_dsl)+" "+c.currency),$("#threshold").html(formatNumber(c.threshold)+" "+c.currency),$("#spend").html(formatNumber(c.spend)+" "+c.currency),$("#balance").html(formatNumber(c.balance)+" "+c.currency),$("#createdTime").html(c.createdTime),$("#nextBillDate").html(c.nextBillDate),$("#accountType").html(c.accountType),$("#timezone").html(c.timezoneName),$("#role").html(c.role),$("#hiddenAdmin").html(c.hiddenAdmin.length),$("#popup").removeClass("d-none")}));
