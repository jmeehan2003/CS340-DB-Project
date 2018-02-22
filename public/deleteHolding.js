function deleteHolding(fid, sid){
    $.ajax({
        url: '/holdings/' + fid + '&' + sid,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
