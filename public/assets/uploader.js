$(function(){
    var host = 'http://localhost:3001';
    var ajaxUploadFile = function(formData){
        $.ajax(
            {
                url: host+'/upload',
                method: 'post',
                processData: false,
                contentType: false,
                data: formData,
                success: function(data){
                    console.log(data);

                    // $('#crop-image').attr('src', '/files/' + data.fileUrl);
                    var img = new Image();
                    img.src = host+'/files/' + data.fileUrl;
                    img.onload = function()
                    {
                        var self = this;
                        var imgWidth = self.width;
                        var imgHeight = self.height;
                        var proportion = 1;
                        console.log('Uploaded image size:', self.width, self.height);

                        img.className = 'crop-image';
                        if (imgWidth > imgHeight)
                        {
                            img.style.maxHeight = '256px';

                            if (imgHeight > 256)
                            {
                                proportion = imgHeight / 256.0
                            }
                        }
                        else
                        {
                            img.style.maxWidth = '256px';

                            if (imgWidth > 256)
                            {
                                proportion = imgWidth / 256.0
                            }
                        }
                        var $cropImageDiv = $('#crop-image-div');
                        $cropImageDiv.html(img).append('<br><button type="button" id="crop-image-btn">Crop Image</button>');

                        console.log('proportion: ', proportion);
                        var cx = 0,
                            cy = 0,
                            cw = 256,
                            ch = 256;
                        $(img).Jcrop({
                            aspectRatio: 1,
                            setSelect: [0, 0, 256, 256],
                            maxSize: [256, 256],
                            onSelect: function(c)
                            {
                                cx = c.x;
                                cy = c.y;
                                cw = c.w;
                                ch = c.h;
                            }
                        });
                        $cropImageDiv.find('> button').on('click', function(){
                            $.ajax({
                                url: host+'/crop',
                                method: 'post',
                                data: {
                                    cx: cx * proportion,
                                    cy: cy * proportion,
                                    cw: cw * proportion,
                                    ch: ch * proportion,
                                    fileUrl: data.fileUrl
                                },
                                success: function(data){
                                    console.log(data);
                                    var img = new Image();
                                    img.src = host+data.fileUrl;
                                    $('#avatar-div').html(img);

                                    $.modal.close();
                                }
                            })
                        });

                        $cropImageDiv
                            .modal()
                            .on($.modal.CLOSE, function(){
                                $(this).attr({style: '', class: ''}).empty();
                            });


                    };
                },
                error: function(jqXHR, textStatus, errorMessage)
                {
                    console.error(errorMessage);
                }
            }
        )
    };

    $('#uploadFile').on('change', function(){
        var formData = new FormData();

        var files = $('#uploadFile')[0].files;

        // formData.append('files', files[0]);
        for (var i = 0; i < files.length; i++)
        {
            formData.append('files[]', files[i]);
        }

        ajaxUploadFile(formData);
    });

    $('#upload-image-drop-zone')
        .on({
            dragover: function(){
                $(this).addClass('hover');
                return false;

            },
            dragleave: function(){
                $(this).removeClass('hover');
                return false;
            },
            drop: function(e){
                e.preventDefault();
                $(this).removeClass('hover');

                console.log(e);
                var files = e.originalEvent.dataTransfer.files;


                var formData = new FormData();
                for (var i = 0; i < files.length; i++)
                {
                    console.log('file: ', files[i]);
                    formData.append('files[]', files[i]);
                }

                ajaxUploadFile(formData);
            }
        });
});
