
function updatePManager(id){
    $.ajax({
        url: '/portfolio_managers/' + id,
        type: 'PUT',
        data: $('#update-pmanager').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};
