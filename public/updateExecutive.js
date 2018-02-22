
function updateExecutive(id){
    $.ajax({
        url: '/executives/' + id,
        type: 'PUT',
        data: $('#update-executive').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};
