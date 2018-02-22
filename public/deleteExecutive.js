
function deleteExecutive(id){
    $.ajax({
        url: '/executives/' + id,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
