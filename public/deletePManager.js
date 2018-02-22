
function deletePManager(id){
    $.ajax({
        url: '/portfolio_managers/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
