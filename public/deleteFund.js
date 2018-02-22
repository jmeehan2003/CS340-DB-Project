function deleteFund(id){
    $.ajax({
        url: '/funds/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
