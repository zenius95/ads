function getAccessTokenOne() {

    return new Promise(async (resolve, reject) => {
        const data = await fetch('https://business.facebook.com/accountquality/')
        const html = await data.text()

        let accessTokenMatches = html.match(/(?<=\"accessToken\":\")[^\"]*/g)
        let userIdMatches = html.match(/(?<=\"USER_ID\":\")[^\"]*/g)
        let postTokenMatches = html.match(/(?<=\"token\":\")[^\"]*/g)

        accessTokenMatches = accessTokenMatches.filter(item => item.includes('EAA'))

        if (postTokenMatches[0] && postTokenMatches[1] && accessTokenMatches[0] && userIdMatches[0]) {

            localStorage.setItem('accessToken', accessTokenMatches[0])
            localStorage.setItem('fb_dtsg', postTokenMatches[0])
            localStorage.setItem('lsd', postTokenMatches[1])
            localStorage.setItem('fid', userIdMatches[0])

            resolve(accessTokenMatches[0])

        } else {
            
            reject("Can't get access token")
        }

    })

}

function getAccessTokenThree() {

    return new Promise(async (resolve, reject) => {
        const data = await fetch('https://business.facebook.com/content_management')
        const html = await data.text()

        let accessTokenMatches = html.match(/(?<=\"accessToken\":\")[^\"]*/g)
        accessTokenMatches = accessTokenMatches.filter(item => item.includes('EAA'))

        if (accessTokenMatches[0]) {

            resolve(accessTokenMatches[0])

        } else {
            
            reject("Can't get access token")
        }

    })

}

function getAccessTokenTwo() {

    return new Promise(async (resolve, reject) => {
        const data = await fetch('https://www.facebook.com/adsmanager/')
        const html = await data.text()

        let redirect = html.match(/window.location\.replace\("(.+)"/)

        if (redirect) {
            redirect = redirect[1].replace(/\\/g, '')

            const data2 = await fetch(redirect)
            const html2 = await data2.text()

            let accessTokenMatches = html2.match(/window.__accessToken="(.*)";/)

            if (accessTokenMatches[1]) {

                localStorage.setItem('accessToken2', accessTokenMatches[1])
                resolve(accessTokenMatches[1])

            } else {
                
                reject("Can't get access token")
            }
        } else {
            reject("Can't get access token")
        }

    })

}

function getAccessToken() {

    return new Promise(async (resolve, reject) => {

        try {
            
            const accessToken = await getAccessTokenOne()
            await getAccessTokenTwo()

            resolve(accessToken)

        } catch (err) {

            reject(err)

        }
    
    })

}

function getAdAccounts(accessToken, limit = 50, before = '', after = '') {
    return new Promise(async (resolve, reject) => {

        let paging = ''

        if (before.length > 0) {
            paging = '&before='+before
        } else if (after.length > 0) {
            paging = '&after='+after
        }

        const fid = localStorage.getItem('fid')
        const accountsFetch = await fetch("https://graph.facebook.com/v14.0/me/adaccounts?limit="+limit+"&fields=name,account_id,account_status,userpermissions.user("+fid+"){role}&access_token="+accessToken+"&summary=1"+paging+"&locale=en_US")
        const accounts = await accountsFetch.json()

        resolve(accounts)
    })
}

function getAccountInfo(accessToken, id) {
    return new Promise(async (resolve, reject) => {
        const accountFetch = await fetch('https://graph.facebook.com/v14.0/act_'+id+'?access_token='+accessToken+'&fields=["business_city","business_country_code","business_name","business_state","business_street","business_street2","business_zip","currency","id","is_personal","name","owner","tax_id","timezone_id","timezone_name","users{id,is_active,name,role,roles}"]')
        const accountData = await accountFetch.json()

        if (accountData.error) {
            reject(accountData.error.message)
        } else {
            resolve(accountData)
        }

    })
}

function getAccountStats(id, accessToken) {
    return new Promise(async (resolve, reject) => {

        const adStatsUrl = "https://graph.facebook.com/v14.0/act_"+id+"?fields=account_id,owner_business,created_time,next_bill_date,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,business_country_code,disable_reason,adspaymentcycle{threshold_amount},balance,owner,insights.date_preset(maximum){spend}&access_token="+accessToken
        const adStatPrepayUrl = "https://graph.facebook.com/v14.0/act_"+id+"?fields=is_prepay_account&access_token="+accessToken

        const adStatsFetch = await fetch(adStatsUrl)
        const adStats = await adStatsFetch.json()

        const data = {
            id: adStats.account_id,
            balance: adStats.balance,
            threshold: adStats.adspaymentcycle ? adStats.adspaymentcycle.data[0].threshold_amount : '',
            spend: adStats.insights ? adStats.insights.data[0].spend : '0',
            createdTime: adStats.created_time,
            nextBillDate: adStats.next_bill_date,
            timezoneName: adStats.timezone_name,
            limit: adStats.adtrust_dsl,
            currency: adStats.currency,
            disableReason: adStats.disable_reason,
            countryCode: adStats.business_country_code ?? '',
            ownerBusiness: adStats.owner_business ? adStats.owner_business.id : null
        }

        const adStatPrepayFetch = await fetch(adStatPrepayUrl)
        const adPrepay = await adStatPrepayFetch.json()

        if (adPrepay.error) {
            data.prePay = ''
        } else {
            data.prePay = adPrepay.is_prepay_account ? 'TT' : 'TS'
        }

        resolve(data)
    })
}

function renameAdAccount(id, name, accessToken) {
    return new Promise(async (resolve, reject) => {
        //timezone_id, currency
        const renameFetch = await fetch("https://graph.facebook.com/v14.0/act_"+id+"?name="+encodeURIComponent(name)+"&method=post&access_token="+accessToken+"&locale=en_US")
        const rename = await renameFetch.json()

        if (rename.success) {
            resolve()
        } else {
            reject()
        }

    })
}


function removeAdAccount(id, uid, accessToken) {
    return new Promise(async (resolve, reject) => {
        
        const deleteFetch = await fetch('https://graph.facebook.com/v14.0/act_'+id+'/users/'+uid+'?method=DELETE&access_token='+accessToken+'&locale=vi_VN')
        const result = await deleteFetch.json()

        if (result.error) {
            reject(result.error.message)
        } else {
            resolve()
        }

    })
}

function removeBmAccount(uid, accessToken) {
    return new Promise(async (resolve, reject) => {
        
        const deleteFetch = await fetch('https://graph.facebook.com/v14.0/'+uid+'?method=delete&access_token='+accessToken)
        const result = await deleteFetch.json()

        if (result.error) {
            reject(result.error.message)
        } else {
            resolve()
        }

    })
}

function addAdAccount(id, uid, accessToken, role) {

    return new Promise(async (resolve, reject) => {
        
        const deleteFetch = await fetch('https://graph.facebook.com/v14.0/act_'+id+'/users?method=POST&access_token='+accessToken+'&role='+role+'&uid='+uid+'&locale=vi_VN')
        const result = await deleteFetch.json()

        console.log(result)

        if (result.error) {
            reject()
        } else {
            resolve()
        }

    })

}

function changeBillingInfo(id, lsd, dtsg, data) {
    return new Promise(async (resolve, reject) => {
        
        const formData = new FormData()
        const billingData = {
            input: {
                billable_account_payment_legacy_account_id: id,
                currency: null,
                tax: data,
                timezone: null,
                client_mutation_id: "28"
            }
        }

        formData.append('fb_dtsg', dtsg)
        formData.append('lsd', lsd)
        formData.append('variables', JSON.stringify(billingData))
        formData.append('doc_id', '5428097817221702')
        formData.append('locale', 'vi_VN')

        const changeBillingFetch = await fetch('https://www.facebook.com/api/graphql/', {
            method: 'POST',
            body: formData,
        })

        const result = await changeBillingFetch.json()

        if (result.errors) {
            reject(result.errors[0].description)
        } else {
            resolve(result)
        }

    })
}

function getAccountQuality(id) {
    return new Promise(async (resolve, reject) => {
        
        const formData = new FormData() 

        const fb_dtsg = localStorage.getItem('fb_dtsg')
        const lsd = localStorage.getItem('lsd')
        const fid = localStorage.getItem('fid')

        formData.append('fb_dtsg', fb_dtsg)
        formData.append('lsd', lsd)
        formData.append('variables', '{"assetOwnerId":"'+fid+'"}')
        formData.append('doc_id', '5816699831746699')

        const qualityFetch = await fetch('https://www.facebook.com/api/graphql/', {
            method: 'POST',
            body: formData,
        })

        const result = await qualityFetch.json()

        if (!result.error) {

            let data = ''

            const restriction_type = result.data.assetOwnerData.advertising_restriction_info.restriction_type
            const status = result.data.assetOwnerData.advertising_restriction_info.status
            const ufac_state = result.data.assetOwnerData.advertising_restriction_info.additional_parameters ?
            result.data.assetOwnerData.advertising_restriction_info.additional_parameters.ufac_state : null


            if (restriction_type === 'RISK_REVIEW') {
                data = 'Xác minh thẻ'
            } else if (status === 'APPEAL_TIMEOUT') {
                data = 'Cần kháng 273'
            } else if (status === 'NOT_RESTRICTED') {
                data = 'VIA BT'
            } else if (restriction_type === 'PREHARM' && status === 'VANILLA_RETRICTION') {
                data = 'XMDT'
            } else if (restriction_type === 'PREHARM' && status === 'APPEAL_REJECTED_NO_RETRY') {
                data = 'Hạn chế đỏ XMDT'
            } else if (restriction_type === 'ALE' && status === 'APPEAL_REJECTED_NO_RETRY') {
                data = 'Hạn chế vĩnh viễn'
            } else if (restriction_type === 'ALE' && ufac_state === 'TIMEOUT') {
                data = 'Hạn chế đỏ 902'
            } else if (restriction_type === 'ALE' && ufac_state === null) {
                data = '902'
            } else if (restriction_type === 'ALE' && status === 'APPEAL_PENDING') {
                data = 'Đang kháng 902'
            } else if (restriction_type === 'ALE' && status === 'APPEAL_ACCEPTED') {
                data = 'Tích 902'
            } else if (restriction_type === 'PREHARM' && status === 'APPEAL_ACCEPTED') {
                data = 'Tích XMDT'
            } else if (restriction_type === 'PREHARM' && status === 'APPEAL_PENDING') {
                data = 'Đang kháng XMDT'
            } else {
                data = 'Không xác định'
            }

            resolve(data)
        }

    })
}

function getBussinesses(accessToken) {

    return new Promise(async (resolve, reject) => {

        const bmFetch = await fetch("https://graph.facebook.com/v14.0/me/businesses?fields=name,id,verification_status,business_users,allow_page_management_in_www,sharing_eligibility_status,created_time,permitted_roles,client_ad_accounts.summary(1),owned_ad_accounts.summary(1)&limit=9999999&access_token="+accessToken)
        const bmData = await bmFetch.json()

        resolve(bmData)

    })
}

function getBmLimit(id) {
    
    return new Promise(async (resolve, reject) => {

        const fb_dtsg = localStorage.getItem('fb_dtsg')
        const lsd = localStorage.getItem('lsd')

        const bmFetch = await fetch("https://business.facebook.com/business/adaccount/limits/?business_id="+id+"&__a=1&fb_dtsg="+fb_dtsg+"&lsd="+lsd)
        const bmData = await bmFetch.text()

        const result = JSON.parse(bmData.replace('for (;;);', ''))

        if (result.payload) {
            resolve(result.payload.adAccountLimit)
        } else {
            reject()
        }

    })
}

function getAccountUsers(id, accessToken) {
    return new Promise(async (resolve, reject) => {
        const usersFetch = await fetch('https://graph.facebook.com/v14.0/act_'+id+'/users?method=GET&access_token='+accessToken)
        const users = await usersFetch.json()

        if (users.data) {
            resolve(users.data)
        } else {
            reject()
        }
    })
}

function getHiddenAccount(id) {
    return new Promise(async (resolve, reject) => {

        try {
            const dataFetch = await fetch('https://www.facebook.com/ads/manager/account_settings/information/?act='+id)
            const html = await dataFetch.text()

            const hiddenUsers = html.match(/\b(\d+)\,(name:null)\b/g).map(item => {

                return {
                    id: item.replace(',name:null', ''),
                    name: 'Người dùng Facebook'
                }
            })

            resolve(hiddenUsers)

        } catch {
            resolve([])
        }
        
    })
}

function checkBmHiddenAdmin(id, accessToken, accessToken2) {

    return new Promise(async (resolve, reject) => {

        const bmFetch = await fetch('https://graph.facebook.com/v14.0/'+id+'/business_users?access_token='+accessToken+'&fields=email,+first_name,+last_name,+id,+pending_email,+role&limit=300')
        const bmData = await bmFetch.json()

        const bmFetch2 = await fetch('https://graph.facebook.com/v14.0/'+id+'/business_users?access_token='+accessToken2+'&fields=email,+first_name,+last_name,+id,+pending_email,+role&limit=300')
        const bmData2 = await bmFetch2.json()

        if (bmData.error && bmData2.error) {

            reject(bmData.error.message)

        } else {
            if (bmData.data.length < bmData2.data.length) {

                const activeUsers = bmData.data.map(user => {
                    return user.email
                })

                const allUsers = bmData2.data.map(user => {
                    return user.email
                })

                let hiddenUsers = []

                allUsers.filter(x => !activeUsers.includes(x)).forEach(item => {

                    const user = bmData2.data.filter(user => {
                        return item == user.email
                    })

                    hiddenUsers.push(user[0])
                })

                resolve(hiddenUsers)

            } else {
                resolve([])
            }
        }
        
    })
}

function searchTarget(accessToken, keyword, locale) {
    return new Promise(async (resolve, reject) => {

        const dataFetch = await fetch("https://graph.facebook.com/v14.0/search?limit=1000000&locale="+locale+"&q="+encodeURIComponent(keyword)+"&transport=cors&type=adinterest&access_token="+accessToken)
        const data = await dataFetch.json()

        resolve(data)

    })
}

function getWebToken() {

    return new Promise((resolve, reject) => {

        
        chrome.cookies.getAll({domain: "via.local"}, function(cookies) {
        
            const token = cookies.filter(cookie => {
                return cookie.name === 'token'
            })
    
            if (token[0]) {
                resolve(token[0].value)
            } else {
                reject()
            }
        
        })
    })
}

function getDisableReason(number) {

    const reasons = {
        0: '',
        1: 'ADS_INTEGRITY_POLICY',
        2: 'ADS_IP_REVIEW',
        3: 'RISK_PAYMENT',
        4: 'GRAY_ACCOUNT_SHUT_DOWN',
        5: 'ADS_AFC_REVIEW',
        6: 'BUSINESS_INTEGRITY_RAR',
        7: 'PERMANENT_CLOSE',
        8: 'UNUSED_RESELLER_ACCOUNT',
    }

    return reasons[number]

}

function formatNumber(number) {

    const money = new Intl.NumberFormat('en-US')

    return number ? money.format(number) : ''
}

function nano(template, data) {
    return template.replace(/\{([\w\.]*)\}/g, function(str, key) {
        var keys = key.split("."), v = data[keys.shift()]
        for (var i = 0, l = keys.length; i < l; i++) v = v[keys[i]]
        return (typeof v !== "undefined" && v !== null) ? v : ""
    });

}

function render(template, data = {}) {

    return new Promise((resolve, reject) => {
        $.get("../templates/"+template+".html", function(html) {
            resolve(nano(html, data))
        })
    })

}

function renderLoop(template, data = {}) {

    return new Promise((resolve, reject) => {
        $.get("../templates/"+template+".html", function(html) {

            let result = ''
            
            for (let index = 0; index < data.length; index++) {
                const item = data[index]
                result += nano(html, item)
            }
            
            resolve(result)
        })
    })

}

function getFormData(selector) {

    const data = $(selector).serializeArray()

    var values = {}

    data.forEach(field => {
        values[field.name] = field.value ?? ''
    })

    return values

}

function getRoleName(id) {

    const number = parseInt(id)

    const reasons = {
        1001: 'Quản trị viên',
        1002: 'Nhà quảng cáo',
        1003: 'Nhà phân tích',
    }

    return reasons[number] ?? ''
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}