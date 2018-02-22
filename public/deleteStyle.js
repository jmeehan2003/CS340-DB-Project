function deleteStyle(id){
    $.ajax({
        url: '/styles/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
