function deleteStock(id){
    $.ajax({
        url: '/stocks/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
