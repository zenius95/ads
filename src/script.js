const accountTable = {
    retrieve: true,
    searching: true,
    ordering: true,
    info: false,
    paging: false,
    lengthChange: false,
    order: [[1, 'asc']],
    columnDefs: [
        {
            orderable: false,
            targets: 0
        }
    ],
    language: {
        emptyTable: "Không có dữ liệu"
    }
}

const bmAccountTable = {
    retrieve: true,
    searching: true,
    ordering: true,
    info: false,
    paging: false,
    lengthChange: false,
    order: [[1, 'asc']],
    columnDefs: [
        {
            orderable: false,
            targets: 0
        }
    ],
    language: {
        emptyTable: "Không có dữ liệu"
    }
}

const notyf = new Notyf({
    position: {
        x: 'right',
        y: 'bottom',
    },
    duration: 4000,
    dismissible: true
})

const appLoading = {
    message: '<div class="d-flex align-items-center"><span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang tải dữ liệu, vui lòng chờ...</div>',
    icon: '',
    position: {
        x: 'right',
        y: 'bottom',
    },
    background: '#ffc107',
    duration: 100000000,
    dismissible: false,
}

async function accountLoading() {

    const html = await render('accountLoading')

    $('#accounts .table').DataTable().destroy()

    $('#accounts tbody').empty().html(html)

}

async function bmAccountLoading() {

    const html = await render('bmAccountLoading')

    $('#bmAccounts .table').DataTable().destroy()

    $('#bmAccounts tbody').empty().html(html)

}

async function adsLoading() {

    const html = await render('adsLoading')

    $('#adsTable tbody').empty().html(html)

}

async function loadAccounts(limit, before = '', after = '') {
    
    new PerfectScrollbar('#accounts')

    const accessToken = localStorage.getItem('accessToken')

    const accounts = await getAdAccounts(accessToken, limit, before, after)

    notyf.dismissAll()

    const maxPage = Math.ceil(accounts.summary.total_count / limit)

    if (accounts.paging.next) {
        $('#account-next').attr('data-next', accounts.paging.cursors.after)
    }

    if (accounts.paging.previous) {
        $('#account-prev').attr('data-prev', accounts.paging.cursors.before)
    }
    

    $('#account-page-max').text(maxPage)

    const items = []

    for (let index = 0; index < accounts.data.length; index++) {

        const account = accounts.data[index]

        account.role = account.userpermissions ? account.userpermissions.data[0].role : ''
        
        items.push({
            account_id: account.account_id,
            name: account.name,
            hiddenUsers: account.hiddenUsers,
            role: account.role,
            account_status: account.account_status
        })

    }

    const html = await renderLoop('account', items)

    $('#accounts tbody').html(html)
    
    $('#accounts tbody tr').each(async function() {

        const id = $(this).attr('data-id')

        let stats = {}

        if (!localStorage.getItem('act_'+id)) {

            stats = await getAccountStats(id, accessToken)

            localStorage.setItem('act_'+id, JSON.stringify(stats))

        } else {

            stats = JSON.parse(localStorage.getItem('act_'+id))
        }
        
        stats.createdTime = moment(stats.createdTime).format('DD/MM/YYYY')
        stats.nextBillDate = moment(stats.nextBillDate).format('DD/MM/YYYY')

        const nextBillDate = moment(stats.nextBillDate, 'DD/MM/YYYY')
        const currentDate = moment(moment().format('DD/MM/YYYY'), 'DD/MM/YYYY')

        stats.dayRemain = moment.duration(nextBillDate.diff(currentDate)).asDays()

        stats.remain = parseInt(stats.threshold) - parseInt(stats.balance)

        stats.disableReason = getDisableReason(stats.disableReason)

        stats.accountType = stats.ownerBusiness !== null ? 'Bussiness' : 'Cá nhân'

        stats.balance = formatNumber(stats.balance)
        stats.threshold = formatNumber(stats.threshold)
        stats.remain = formatNumber(stats.remain)
        stats.limit = stats.limit != -1 ? formatNumber(stats.limit) : 'No Limit'
        stats.spend = formatNumber(stats.spend)

        $(this).find('td[data-id="balance"]').html(stats.balance).removeClass('row-loading')
        $(this).find('td[data-id="threshold"]').html(stats.threshold).removeClass('row-loading')
        $(this).find('td[data-id="remain"]').html(stats.remain).removeClass('row-loading')
        $(this).find('td[data-id="limit"]').html(stats.limit).removeClass('row-loading')
        $(this).find('td[data-id="spend"]').html(stats.spend).removeClass('row-loading')
        $(this).find('td[data-id="currency"]').html(stats.currency+'/'+stats.prePay).removeClass('row-loading')
        $(this).find('td[data-id="accountType"]').html(stats.accountType).removeClass('row-loading')
        $(this).find('td[data-id="hiddenUsers"]').html(stats.hiddenUsers).removeClass('row-loading')
        $(this).find('td[data-id="disableReason"]').html(stats.disableReason).removeClass('row-loading')
        $(this).find('td[data-id="createdTime"]').html(stats.createdTime).removeClass('row-loading')
        $(this).find('td[data-id="nextBillDate"]').html(stats.nextBillDate).removeClass('row-loading')
        $(this).find('td[data-id="dayRemain"]').html(stats.dayRemain).removeClass('row-loading')
        $(this).find('td[data-id="countryCode"]').html(stats.countryCode).removeClass('row-loading')
        $(this).find('td[data-id="ownerBusiness"]').html(stats.ownerBusiness).removeClass('row-loading')
        $(this).find('td[data-id="timezoneName"]').html(stats.timezoneName).removeClass('row-loading')
        
    })

}

async function loadBmAccounts() {

    bmAccountLoading()

    const loading = notyf.success(appLoading)
    
    new PerfectScrollbar('#bmAccounts')
    
    const accessToken = localStorage.getItem('accessToken')

    const bmAccounts = await getBussinesses(accessToken)

    notyf.dismiss(loading)

    const items = []

    for (let index = 0; index < bmAccounts.data.length; index++) {

        const account = bmAccounts.data[index]

        account.role = account.permitted_roles[0]
        account.verify = account.verification_status.replace('_', ' ').toUpperCase()
        account.numAccount = account.owned_ad_accounts.data.length + account.client_ad_accounts.data.length
        account.numAdmin = account.business_users.data.length
        account.status = account.allow_page_management_in_www ? 1 : 2

        account.createdTime = moment(account.created_time).format('DD/MM/YYYY')

        items.push(account)

    }

    const html = await renderLoop('bmAccount', items)

    $('#bmAccounts tbody').html(html)

    $('#bmAccounts tbody tr').each(async function() {

        const id = $(this).attr('data-id')

        let limit = ''


        if (!localStorage.getItem('bm_'+id+'_limit')) {

            try {
                limit = await getBmLimit(id)
                localStorage.setItem('bm_'+id+'_limit', limit)
            } catch {
                limit = ''
            }
        } else {
            limit = localStorage.getItem('bm_'+id+'_limit')
        }

        $(this).find('td[data-id="bmType"]').html('<span class="badge text-bg-info">BM'+limit+'</span>').removeClass('row-loading')

    })

}

async function loadAds(id) {

    $('#adTypeTab button').removeClass('active')
    $('#adTypeTab button[data-type="all"]').addClass('active')

    adsLoading()

    const accessToken = localStorage.getItem('accessToken')
    const adImagesFetch = await fetch('https://graph.facebook.com/v14.0/act_'+id+'/adimages?limit=100&fields=name,url_128,ads_integrity_review_info,creatives&access_token='+accessToken)
    const adVideosFetch = await fetch('https://graph.facebook.com/v14.0/act_'+id+'/advideos?limit=100&fields=id,picture,creatives,ads_integrity_review_info&access_token='+accessToken)

    const adImages = await adImagesFetch.json()
    const adVideos = await adVideosFetch.json()

    const data = adImages.data.concat(adVideos.data)

    let html = ''
    data.forEach(item => {

        html += `
            <tr data-id="${item.id}" data-type="${item.ads_integrity_review_info.comp_type === 'VIDEO' ? 'video' : 'image'}">
                <td class="text-center">${item.ads_integrity_review_info.comp_type === 'VIDEO' ? 'VIDEO' : 'IMAGE'}</td>
                <td class="text-center"><img src="${item.picture ?? item.url_128}" style="height:50px;width:50px;object-fit:cover;"></td>
                <td class="text-center">${item.creatives ? item.creatives.length : '-'}</td>
                <td class="text-center">${ 
                    item.ads_integrity_review_info.is_reviewed 
                    ? '<i class="ri-checkbox-circle-fill fs-5 fw-normal text-success"></i>' 
                    : '<i class="ri-close-circle-fill fs-5 fw-normal text-danger"></i>' }
                </td>
                <td class="text-center">${ 
                    item.ads_integrity_review_info.is_human_reviewed 
                    ? '<i class="ri-checkbox-circle-fill fs-5 fw-normal text-success"></i>' 
                    : '<i class="ri-close-circle-fill fs-5 fw-normal text-danger"></i>' }
                </td>

            </tr>
        `

    })

    $('#adsTable tbody').empty().html(html)

    new PerfectScrollbar('#adsTable')

}

$('body').on('click', '.selectable', async function() {

    const target = $(this).attr('data-target')
    const value = $(this).attr('data-value')
    const text = $(this).text()

    $('#'+target).text(text)
    $('#'+target).attr('data-value', value)

    localStorage.setItem(target, value)

    accountLoading()
    loadAccounts(value)

})

$('body').on('click', '#account-next', async function() {

    const limit = $('#account-limit').attr('data-value')
    const after = $(this).attr('data-next')
    const page = parseInt($('#account-page').text())
    
    if (after.length > 0) {
        $(this).attr('data-next', '')
        $('#account-page').text(page + 1)
        accountLoading()
        loadAccounts(limit, '', after)
    }

})

$('body').on('click', '#account-prev', async function() {

    const limit = $('#account-limit').attr('data-value')
    const before = $(this).attr('data-prev')
    const page = parseInt($('#account-page').text())
    
    if (before.length > 0) {
        $(this).attr('data-prev', '')
        $('#account-page').text(page - 1)
        accountLoading()
        loadAccounts(limit, before)
    }

})

$('body').on('keyup', '#account-search', async function() {

    const keyword = $(this).val()

    if ($('#tab-accounts').hasClass('active')) {
        $('#accounts .table').DataTable().search(keyword).draw()
    } else {
        $('#bmAccounts .table').DataTable().search(keyword).draw()
    }

})

$('body').on('click', '#selectAllAccount', async function() {

    if ($(this).is(':checked')) {
        $('#accounts .form-check-input[data-check]').each(function() {
            $(this).prop('checked', true)
        })
    } else {
        $('#accounts .form-check-input[data-check]').each(function() {
            $(this).prop('checked', false)
        })
    }

})

$('body').on('click', '#selectAllBm', async function() {

    if ($(this).is(':checked')) {
        $('#bmAccounts .form-check-input[data-check]').each(function() {
            $(this).prop('checked', true)
        })
    } else {
        $('#bmAccounts .form-check-input[data-check]').each(function() {
            $(this).prop('checked', false)
        })
    }

})

$('body').on('click', '#checkBmHiddenAdminButton', async function() {

    if ($('#hiddenAdminModal').length === 0) {
        
        const data = await render('hiddenAdminModal')

        $('body').append(data)

    }

    $('#hiddenAdminModal').modal('show')

    const id = $(this).attr('data-id')
    const accessToken = localStorage.getItem('accessToken')
    const accessToken2 = localStorage.getItem('accessToken2')

    const hiddenAdmins = await checkBmHiddenAdmin(id, accessToken, accessToken2)

    const html = await renderLoop('accountUsers', hiddenAdmins.map(user => {

        user.name = user.first_name+' '+user.last_name+' ('+user.role+')'
        user.role = user.email
    
        return user

    }))

    $('#hiddenBmAdmins').html(html)

    document.getElementById('hiddenAdminModal').addEventListener('hidden.bs.modal', event => {
        $('#hiddenAdminModal').remove()
    })

})

$('body').on('click', '#changeInfoButton', async function() {

    if ($('#changeAccountModal').length === 0) {
        
        const data = await render('accountModal')

        $('body').append(data)

    }

    const loading = notyf.success(appLoading)

    const id = $(this).attr('data-id')

    const accessToken = localStorage.getItem('accessToken')

    const accountInfo = await getAccountInfo(accessToken, id)
    
    $('#changeAccountModal input[type="hidden"][name="account_id"]').val(id)

    $('#changeAccountModal input[name="name"]').val(accountInfo.name)
    $('#changeAccountModal input[name="bussiness_name"]').val(accountInfo.business_name)
    $('#changeAccountModal input[name="bussiness_street_1"]').val(accountInfo.business_street)
    $('#changeAccountModal input[name="bussiness_street_2"]').val(accountInfo.business_street2)
    $('#changeAccountModal input[name="bussiness_city"]').val(accountInfo.bussiness_city)
    $('#changeAccountModal input[name="bussiness_tax"]').val(accountInfo.tax_id)

    if (accountInfo.is_personal === 0) {
        $('#changeAccountModal input[name="is_persional_use"][value="0"]').prop('checked', true)
    } else {
        $('#changeAccountModal input[name="is_persional_use"][value="1"]').prop('checked', true)
    }

    $('#changeAccountModal select[name="currency"] option[value="'+accountInfo.currency+'"]').prop('selected', true)
    $('#changeAccountModal select[name="bussiness_country"] option[value="'+accountInfo.business_country_code+'"]').prop('selected', true)
    
    $('#changeAccountModal select[name="timezone"] option:first-child').text(accountInfo.timezone_name)

    $('#accountUsers') 

    notyf.dismiss(loading)
    
    $('#changeAccountModal').modal('show')

    document.getElementById('infoTabNav').addEventListener('shown.bs.tab', async e => {
        if (e.target.getAttribute('data-bs-target') == '#edit-role' && !$('#accountUsers').hasClass('loaded')) {

            $('#accountUsers').addClass('loaded')
            
            const accessToken = localStorage.getItem('accessToken2')
            const id = $('#changeAccountModal input[type="hidden"][name="account_id"]').val()
            const users = await getAccountUsers(id, accessToken)

            const accountUsers = users.map(user => {

                user.role = getRoleName(user.role)

                return user
            })
    
            $('#accountUsers').html(await renderLoop('accountUsers', accountUsers))

            try {
                const hiddenUsers = await getHiddenAccount(id)
        
                if (hiddenUsers.length > 0) {
                    $('#edit-role label.d-none').removeClass('d-none')
                    $('#hiddenUsers').html(await renderLoop('accountUsers', hiddenUsers))
                }

            } catch {

            }

        }
    })

    document.getElementById('changeAccountModal').addEventListener('hidden.bs.modal', event => {
        $('#changeAccountModal').remove()
    })

})

$('body').on('click', '#changeAccountModal .removeAccount', async function() {

    const uid = $(this).attr('data-id')
    const accountId =  $('input[type="hidden"][name="account_id"]').val()
    const accessToken = localStorage.getItem('accessToken2')

    try {

        await removeAdAccount(accountId, uid, accessToken)

        $('div[data-account="'+uid+'"]').fadeOut(400)

        notyf.success({message: 'Xóa thành công!'})

    } catch (err) {

        notyf.error({message: 'Không thể xóa tài khoản!'})
        
    }

})

$('body').on('click', '#hiddenAdminModal .removeAccount', async function() {

    const uid = $(this).attr('data-id')
    const accessToken = localStorage.getItem('accessToken2')

    try {

        await removeBmAccount(uid, accessToken)

        $('div[data-account="'+uid+'"]').fadeOut(400)

        notyf.success({message: 'Xóa thành công!'})

    } catch (err) {

        notyf.error({message: 'Không thể xóa tài khoản!'})
        
    }

})

$('body').on('click', '#saveBussinessInfo', async function() {

    $(this).prop('disabled', true)

    var formData = getFormData('#changeBussinessInfo')

    const data = {
        business_address: {
            city: formData.bussiness_city,
            country_code: formData.bussiness_country,
            state: formData.bussiness_state,
            street1: formData.bussiness_street_1,
            street2: formData.bussiness_street_2,
            zip: formData.bussiness_zip
        },
        business_name: formData.bussiness_name,
        is_personal_use: formData.is_persional_use === '1' ? true : false,
        tax_id: formData.bussiness_tax,
    }

    try {

        const lsd = localStorage.getItem('lsd')
        const fb_dtsg = localStorage.getItem('fb_dtsg')

        await changeBillingInfo(formData.account_id, lsd, fb_dtsg, data)

        $(this).prop('disabled', false)

        $('#changeAccountModal').modal('hide')

        notyf.success({message: 'Đổi thông tin doanh nghiệp thành công!'})

    } catch (err) {

        $(this).prop('disabled', false)

        notyf.error({message: err})

    }
    
})

$('body').on('click', '#saveAccountInfo', async function() {

    $(this).prop('disabled', true)

    const accessToken = localStorage.getItem('accessToken')

    var formData = getFormData('#changeAccountInfo')

    if (formData.name.length > 0) {

        try {

            await renameAdAccount(formData.account_id, formData.name, accessToken)

            $('#changeAccountModal').modal('hide')

            $(this).prop('disabled', false)

            notyf.success({message: 'Đổi thông tin tài khoản thành công!'})

        } catch (err) {

            $(this).prop('disabled', false)

            notyf.error({message: 'Không thể đổi thông tin tài khoản!'})

        }

    } else {
        $(this).prop('disabled', false)
        notyf.error({message: 'Xin mời nhập tên!'})
    }
    
})

$('body').on('click', '#addAccountButton', async function() {

    $(this).prop('disabled', true)

    var formData = getFormData('#addAccount')

    if (formData.uid.length > 0) {

        const accountId =  $('input[type="hidden"][name="account_id"]').val()
        const accessToken = localStorage.getItem('accessToken2')

        try {

            await addAdAccount(accountId, formData.uid, accessToken, formData.role)

            const newDataFectch = await fetch('https://graph.facebook.com/v14.0/act_'+accountId+'/users?method=GET&access_token='+accessToken)
            const newData = await newDataFectch.json()

            if (!newData.data) {

                notyf.error({message: 'Không thể lấy danh sách tài khoản!'})

            } else {

                const users = []

                for (let index = 0; index < newData.data.length; index++) {

                    const user = newData.data[index]

                    user.role = getRoleName(user.role)
                
                    users.push(user)
                }

                const html = await renderLoop('accountUsers', users)

                $('#accountUsers').html(html)

                $(this).prop('disabled', false)

            }

        } catch (err) {
            $(this).prop('disabled', false)
            notyf.error({message: 'Không thể thêm tài khoản!'})
        }
 
    } else {
        $(this).prop('disabled', false)
        notyf.error({message: 'Xin mời nhập ID cần thêm!'})
        
    }
    
})

$('body').on('change', '#adAccountSelect', function() {

    const value = $(this).find('option:selected').val()

    loadAds(value)

})

$('body').on('click', '.action-button', async function() {

    if ($('#bulkHiddenAdminModal').length === 0) {
        
        const data = await render('bulkHiddenAdminModal')

        $('body').append(data)

    }

    const ids = []

    let elem = '#accounts'

    if ($('#tab-bm-accounts').hasClass('show')) {
        elem = '#bmAccounts'
    }
        
    $(elem).find('td .form-check-input').each(function() {

        if ($(this).is(':checked')) {

            ids.push($(this).attr('data-check'))

        }
    })

    if (ids.length > 0) {

        $('#bulkHiddenAdminModal').modal('show')

        new PerfectScrollbar('#hiddenAdminsTable')

        const accessToken = localStorage.getItem('accessToken')
        const accessToken2 = localStorage.getItem('accessToken2')

        for (let index = 0; index < ids.length; index++) {

            const id = ids[index]

            let hiddenAdmins = []

            try {
                if (elem == '#bmAccounts') {
                    hiddenAdmins = await checkBmHiddenAdmin(id, accessToken, accessToken2)
                } else {
                    hiddenAdmins = await getHiddenAccount(id)
                }
            } catch (err) {
                notyf.error({message: err})
                break
            }

            if (hiddenAdmins.length > 0) {

                const hiddenAdminIds = hiddenAdmins.map(user => {

                    return user.id
                })

                hiddenAdminIds.push('98987987987987987')

                const name = $(elem).find('tr[data-id="'+id+'"] td[data-id="name"] strong').text()
                const status = $(elem).find('tr[data-id="'+id+'"] td[data-id="status"]').attr('data-order')

                let statusHtml = ''
                switch (status) {
                    case '1':
                        statusHtml = '<span class="text-success">Hoạt động</span>'
                        break;

                    case '2':
                        statusHtml = '<span class="text-danger">Vô hiệu hóa</span>'
                        break;
                
                    default:
                        statusHtml = '<span class="text-warning">Cần thanh toán</span>'
                        break;
                }

                let hiddenHtml = ''

                hiddenAdmins.forEach(user => {

                    if (elem == '#bmAccounts') {
                        hiddenHtml += `
                            <li>
                                <strong style="font-size: 12px" class="d-block">${user.first_name} ${user.last_name} (${user.role})</strong>
                                <span class="fw-normal" style="font-size: 12px">${user.id}</span>
                            </li>
                        `
                    } else {

                    }
                })

                console.log(hiddenAdmins)

                const html = `
                    <tr data-id="${id}">
                        <td>
                            <strong class="d-block">${name}</strong>
                            <span class="fw-medium">${id}</span>
                        </td>
                        <td data-order="${status}">${statusHtml}</td>
                        <td data-order="${hiddenAdminIds.length}" style="100px">
                            <ul style="list-style: disc">
                                ${hiddenHtml}
                            </ul>
                        </td>
                        <td class="text-center" data-users="${ hiddenAdminIds.join(',') }"></td>
                    </tr>
                `     

                $('#hiddenAdminsTable tbody').append(html)

            }
            
        }

        $('#hiddenAdminsTable table').DataTable({
            searching: true,
            ordering: true,
            info: false,
            paging: false,
            lengthChange: false,
            language: {
                emptyTable: "Không tìm thấy Admin ẩn"
            }
        })

        $('#deleteAllHiddenAdmin').prop('disabled', false).find('span:not(.spinner-border)').text('Xóa Admin ẩn')

    } else {
        notyf.error({
            message: 'Xin mời chọn ít nhất 1 tài khoản',
        })
    }

    document.getElementById('bulkHiddenAdminModal').addEventListener('hidden.bs.modal', event => {
        $('#bulkHiddenAdminModal').remove()
    })

})


$('body').on('click', '#deleteAllHiddenAdmin', async function() {

    const accessToken = localStorage.getItem('accessToken2')

    if (!$(this).is(':disabled')) {

        $(this).prop('disabled', true).find('span:not(.spinner-border)').text('Đang xóa Admin ẩn...')

        for (let index = 0; index < $('#hiddenAdminsTable tbody tr').length; index++) {
            const row = $('#hiddenAdminsTable tbody tr')[index]
            const id = $(row).attr('data-id')
            const hiddenUsers = $(row).find('[data-users]').attr('data-users').split(',')

            $(row).find('[data-users]').html('<div class="spinner-border spinner-border-sm text-secondary" role="status"></div>')

            let number = 0

            for (let i = 0; i < hiddenUsers.length; i++) {
                const uid = hiddenUsers[i]
                
                try {

                    if ($('#tab-bm-accounts').hasClass('show')) {
                        await removeBmAccount(uid, accessToken)
                    } else {
                        await removeAdAccount(id, uid, accessToken)
                    }

                    number++

                } catch {

                }

                $(row).find('[data-users]').html('Đã xóa: '+number+'/'+hiddenUsers.length)
                
            }
            
        }

        $(this).prop('disabled', false).find('span:not(.spinner-border)').text('Xóa Admin ẩn')

    }

})


$('body').on('click', '#refreshData', function() {

    localStorage.clear()

    location.reload()

})


$('body').on('submit', '#superTargetForm', async function(e) {

    e.preventDefault()

    const formData = getFormData('#superTargetForm')
    const accessToken = localStorage.getItem('accessToken2')

    if (formData.search.length > 0) {

        $('.intro').remove()
        $('#superTargetTable tbody').html(await render('targetLoading'))

        const result = await searchTarget(accessToken, formData.search, formData.locale)

        if (!result.error) {

            let html = ''

            result.data.forEach(item => {
                html += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.topic ?? ''}</td>
                        <td>${item.audience_size}</td>
                        <td>
                            <div class="d-flex">
                                <button type="button" class="btn bg-white border shadow-sm btn-sm rounded-circle me-1">
                                    <i class="ri-file-copy-2-fill fw-normal"></i>
                                </button>
                                <button type="button" class="btn bg-white border shadow-sm btn-sm rounded-circle">
                                    <i class="ri-add-line fw-normal"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `
            })

            $('#superTargetTable tbody').html(html)

        }

    } else {

        notyf.error({message: 'Xin vui lòng nhập từ khóa!'})

    }
    
})

document.getElementById('adTypeTab').addEventListener('shown.bs.tab', e => {
    const type = e.target.getAttribute('data-type')


    if (type === 'all') {
        $('#adsTable tbody tr').css('display', 'table-row')
    } else {
        $('#adsTable tbody tr').css('display', 'none')
        $('#adsTable tbody tr[data-type="'+type+'"]').css('display', 'table-row')
    }
    

})


document.getElementById('accountTabs').addEventListener('shown.bs.tab', e => {
    if (e.target.getAttribute('data-bs-target') == '#tab-bm-accounts') {
        if (!$('#bmAccounts').hasClass('loaded')) {
            $('#bmAccounts').addClass('loaded')
            loadBmAccounts()
        }
        $('a[data-action="changeInfo"]').removeClass('d-flex').addClass('d-none')
    } else {
        $('a[data-action="changeInfo"]').removeClass('d-none').addClass('d-flex')
    }

    $('#accounts .table').DataTable().draw()
    $('#bmAccounts .table').DataTable().draw()
    $('#account-search').val('')
})

document.getElementById('menu-tabs').addEventListener('shown.bs.tab', async (e) => {
    if (e.target.getAttribute('data-bs-target') == '#tab-ads-review' && !$('#tab-ads-review').hasClass('loaded')) {

        $('#adsTable tbody').html(await render('adsLoading'))

        const accessToken = localStorage.getItem('accessToken')
    
        const accountsFetch = await fetch('https://graph.facebook.com/v14.0/me/adaccounts?fields=name,account_id&access_token='+accessToken+'&limit=9999&locale=en_US')
        const accounts = await accountsFetch.json()

        if (accounts.data) {

            let html = ''

            accounts.data.forEach((account, i) => {

                html += `<option value="${account.account_id}">${account.name}</option>`

            })

            $('#adAccountSelect').html(html)
            loadAds(accounts.data[0].account_id)

        }

        $('#tab-ads-review').addClass('loaded')
    }
})

$(document).ready(async function() {

    const loading = notyf.success(appLoading)

    const limit = localStorage.getItem('account-limit') ?? $('#account-limit').attr('data-value')

    if (localStorage.getItem('account-limit')) {

        $('#account-limit').attr('data-value', limit)

        $('#account-limit').text(limit == 99999999 ? 'Max' : limit)
    }

    accountLoading()

    let accessToken = ''

    if (
        !localStorage.getItem('accessToken') 
        || !localStorage.getItem('lsd') 
        || !localStorage.getItem('fb_dtsg') 
        || !localStorage.getItem('accessToken2') 
        || !localStorage.getItem('fid')) 
    
    {

        accessToken = await getAccessToken()

    } else {

        accessToken = localStorage.getItem('accessToken')

    }
    

    try {

        const data = await fetch('https://graph.facebook.com/v14.0/me?access_token='+accessToken)
        const result = await data.json()

        if (result.error) {

            localStorage.removeItem('accessToken')
            localStorage.removeItem('accessToken2')
            localStorage.removeItem('lsd')
            localStorage.removeItem('fb_dtsg')
            localStorage.removeItem('fid')

            notyf.error({
                message: 'Đã xảy ra lỗi, vui lòng thử tải lại Extension',
                duration: 9999999999999,
                dismissible: false
            })

        } else {

            loadAccounts(limit)

            $('button:disabled').prop('disabled', false)
            $('#account-search').prop('disabled', false)

        }

    } catch {

        localStorage.removeItem('accessToken')
        localStorage.removeItem('accessToken2')
        localStorage.removeItem('lsd')
        localStorage.removeItem('fb_dtsg')
        localStorage.removeItem('fid')

        notyf.error({
            message: 'Đã xảy ra lỗi, vui lòng thử tải lại Extension',
            duration: 9999999999999,
            dismissible: false
        })

    }

    let accountStatus = ''

    if (localStorage.getItem('status')) {
        accountStatus = localStorage.getItem('status')
    } else {
        accountStatus = await getAccountQuality()
        localStorage.setItem('status', accountStatus)
    }

    $('#accountStatus').text(accountStatus)

    setInterval(function() {

        if ($('#accounts .table td.row-loading').length === 0) {
            $('#accounts .table').DataTable(accountTable)
        }

        if ($('#bmAccounts .table td.row-loading').length === 0) {
            $('#bmAccounts .table').DataTable(bmAccountTable)
        }

    }, 500)

})
