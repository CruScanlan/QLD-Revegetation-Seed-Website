var typingTimer;
var doneTypingInterval = 350;
var profilePage = 0;
var currentEditProfile;
$(function () {
    tinymce.init({
        selector: 'textarea',
        height: 200,
        menubar: false,
        plugins: [
            'searchreplace wordcount paste'
        ],
        toolbar: 'undo redo | paste',
        browser_spellcheck: true,
        content_css: '//www.tinymce.com/css/codepen.min.css'
    });

    $('#profile-add-photo1-file').on('change', function(){
        var file = $(this).get(0).files[0];
        profileAddPhotoUpload(file,'1',this)
    });

    var profileSearch = $('#profile-search');

    profileSearch.on('keyup', function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTypingProfileSearch, doneTypingInterval);
    });

    profileSearch.on('keydown', function () {
        clearTimeout(typingTimer);
    });

    var profileAddName = $('#profile-add-plant_name');

    profileAddName.on('keyup', function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTypingProfileAddName, doneTypingInterval);
    });

    profileAddName.on('keydown', function () {
        clearTimeout(typingTimer);
    });

    applyModalFixes();

    getProfiles(true);
});

function profileAddPhotoUpload(file,no,fileElement){
    if(file.type != "image/jpeg") {
        $(fileElement).val('');
        return notify('danger','Error','All images must be in jpeg format!');
    }

    var plantName = $('#profile-add-plant_name').val();
    if(plantName == ""){
        $(fileElement).val('');
        return notify('danger','Error','The field "Plant Name" needs to be filled out');
    }

    var formData = new FormData();
    formData.append('image', file);
    formData.append('name', plantName.split(' ').join('-').concat(no));

    var status = $('#profile-add-photo'+no+'-status');
    status.html('<i class="fa fa-spinner fa-lg mt-2 fa-spin" style="margin-top: 0 !important;"></i>');

    if($('#profile-add-photo4-area').length < 1){
        $('#profile-add-file-inputs').append('<div class="row"><div class="form-group col-md-6" style="margin-left: 5px"><label class="col-md-3 form-control-label" for="profile-add-photo'+(Number(no)+1)+'-file">Photo '+(Number(no)+1)+'</label><div class="col-md-9" id="profile-add-photo'+(Number(no)+1)+'-status"><input type="file" class="form-control-file" name="profile-add-photo'+(Number(no)+1)+'-file" id="profile-add-photo'+(Number(no)+1)+'-file"></div></div><div class="form-group col-md-5" id="profile-add-photo'+(Number(no)+1)+'-area"></div></div>');

        $('#profile-add-photo'+(Number(no)+1)+'-file').on('change', function(){
            var file = $(this).get(0).files[0];
            profileAddPhotoUpload(file,String(Number(no)+1),this)
        });
    }

    $.ajax({
        url: '/upload/images/plant-profiles',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
            if(data.err) {
                notify('danger','Error','Image failed to upload');
                return status.html('<i class="fa fa-close fa-lg mt-2" style="margin-top: 0 !important;"></i>');
            }
            notify('success','Success','Image uploaded successfully');
            $('#profile-add-photo'+no+'-area').html('<label class="col-md-2 form-control-label" for="text-input" style="padding: 0; white-space: nowrap">Photo '+no+' Caption</label> <div class="col-md-10" style="padding: 0; max-width: 100%"> <input type="text" id="profile-add-photo'+no+'-caption" class="form-control" data-id="profile-add-photo-caption" value="'+plantName+'"></div>');
            return status.html('<i class="fa fa-check fa-lg mt-2" style="margin-top: 0 !important;"></i>');
        }
    });
}

function addProfile(){
    var plantName = $('#profile-add-plant_name').val();
    if(plantName == "") return notify('danger','Error','The field "Plant Name" needs to be filled out');
    var plantDescription = tinyMCE.get('profile-add-plant_description').getContent();
    if(plantDescription == "") return notify('danger','Error','The field "Plant Description" needs to be filled out');

    var photoCaptions = $('*[data-id="profile-add-photo-caption"]');
    if(photoCaptions.length > 0){
        var photos = {};
        for(var i=0; i<photoCaptions.length; i++){
            var photo = 'photo'+(i+1);
            photos[photo] = $('#profile-add-photo'+(i+1)+'-caption').val();
        }
    }

    var data = {
        name: plantName,
        description: plantDescription,
        map: $('#profile-add-map').is(':checked')
    };

    if(photos) data.photos = photos;

    $.ajax({
        url: '/api/page-editor/plant-profiles/add',
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: 'POST',
        success: function (res) {
            if(!res.err) {
                $('#modal-new-profile').modal('toggle');
                setTimeout(function () {
                    notify('success','Success','Plant profile added. This will take up to 30sec to appear on the website.');
                },250);
                $('#profile-add-plant_name').val('');
                tinyMCE.get('profile-add-plant_description').setContent('');
                $('#profile-add-map').prop('checked', true);
                $('#profile-add-file-inputs').html('<div class="row"><div class="form-group col-md-6" style="margin-left: 5px"><label class="col-md-3 form-control-label" for="profile-add-photo1-file">Photo 1</label><div class="col-md-9" id="profile-add-photo1-status"><input type="file" class="form-control-file" name="profile-add-photo1-file" id="profile-add-photo1-file"></div></div><div class="form-group col-md-5" id="profile-add-photo1-area"></div></div>');
                $('#profile-add-photo1-file').on('change', function(){
                    var file = $(this).get(0).files[0];
                    profileAddPhotoUpload(file,'1',this)
                });
                $('#profile-add-plant_name-form').attr('class','form-group');
                doneTypingProfileSearch();
                $('#profile-add-photo1-file').attr('disabled', true);
                $('#profile-add-save').attr('disabled','disabled');
                return;
            }
            setTimeout(function () {
                notify('danger','Error','There was an error adding that plant profile');
            },250);
        }
    });
}

function getProfiles(clear) {
    profilePage = profilePage+1;
    var query = $('#profile-search').val();

    $.get('/api/page-editor/plant-profiles/card-summary', {
        q:query,
        p: profilePage,
        size: 9
    }, function (data) {
        if(data.err) return notify('danger','Error','Could not retrieve current plant profiles from the server');
        var profileContainer = $('#profile-container');
        if(clear) profileContainer.html(' ');
        profileContainer.append(data.data);
        $('#profile-results-count').html(data.results+" Result(s)");

        var seeMore = $('#profiles-see-more');
        if(seeMore.length == 0)  {
            if(!data.more) return;
            $('#profiles-body').append('<div class="row center-horizontal" style="padding-bottom: 20px; padding-top: 20px" id="profiles-see-more"><button type="button" class="btn btn-info btn-lg center-horizontal" onclick="getProfiles(false);">See More</button></div>');
        }   else    {
            if(!data.more) seeMore.remove();
        }
    })
}

function deleteProfile(plantName)    {
    swal({
            title: "Are you sure?",
            text: "The plant profile will not be able to be recovered",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        },
        function(){
            var data = {
                name: plantName
            };
            $.post("/api/page-editor/plant-profiles/delete",
                data,
                function(data){
                    doneTypingProfileSearch();
                    if(data.err) return swal("Error", "There was an error deleting the plant profile", "error");
                    if(data.warn) return swal("Warning", "The plant profile was deleted from the database but not all photos were deleted.", "warning");
                    return swal("Deleted!", "The plant profile has been deleted", "success");
                }
            ).fail(function() {
                notify('danger','Error','An error occurred while trying to contact the server');
            })
        }
    );
}


function doneTypingProfileAddName() {
    var plantName = $('#profile-add-plant_name').val();
    if(plantName == "") return;

    var data = {
        name: plantName
    };
    $.post("/api/page-editor/plant-profiles/exists",
        data,
        function(data, status){
            if(data.err) return notify('danger','Error','Could not retrieve plant profile names from the server');
            var plantNameForm = $('#profile-add-plant_name-form');
            var save = $('#profile-add-save');
            var fileInput = $('#profile-add-photo1-file');
            if(data.exists) {
                notify('danger','Error','There is already a plant profile by the name of "'+plantName+'"');
                fileInput.attr('disabled','disabled');
                save.attr('disabled','disabled');
                return plantNameForm.attr('class','form-group has-danger');
            }
            fileInput.removeAttr('disabled');
            save.removeAttr('disabled');
            return plantNameForm.attr('class','form-group has-success');
        }
    ).fail(function() {
        notify('danger','Error','An error occurred while trying to contact the server');
    });
}

function doneTypingProfileSearch()   {
    profilePage = 0;
    getProfiles(true);
}

function openEditModal(name){
    var data = {
        name: name
    };
    $.post("/api/page-editor/plant-profiles/edit-info",
        data,
        function(data){
            if(data.err) return notify('danger','Error','Could not retrieve plant profile names from the server');
            currentEditProfile = data.data;
            var plantName = data.data.Plant_Name;
            $('#profile-edit-plant_name').val(plantName);
            $('#profile-edit-modal-title').html(`Edit Plant Profile - ${plantName}`);
            tinyMCE.get('profile-edit-plant_description').setContent(data.data.Plant_Description);
            addPhotosToEditModal(data,plantName);
            $('#profile-edit-map').prop('checked', data.data.Map);

            $('#modal-edit-profile').modal('show');
        }
    ).fail(function() {
        notify('danger','Error','An error occurred while trying to contact the server');
    });
}

function addPhotosToEditModal(data,plantName)   {
    var plantFileName = plantName.split(' ').join('-');
    var photoButtonArea = $('#profile-edit-photo-area');
    photoButtonArea.html(' ');

    for(let i=1; i<5; i++)  {
        if(data.data['Photo_'+i] != null)  {
            photoButtonArea.append(`<div class="form-group col-sm-2" style="margin-bottom: 0; margin-top: 6px; padding-left: 0" id="profile-edit-photo${i}-current-area"><label class="col-md-3 form-control-label" for="profile-edit-photo1-image" style="max-width: 100%">Photo ${i}</label><div class="col-md-9"><button type="button" class="btn btn-secondary" id="profile-edit-photo${i}-current-button" onclick="showEditPhoto('/plant-profiles/images/${plantFileName}',${i})">Current Image</button></div></div><div class="form-group col-sm-3" style="margin-bottom: 0; margin-top: 6px; padding-left: 0"><label class="col-md-3 form-control-label" for="profile-edit-photo${i}-file" style="max-width: 100%">Photo ${i}</label><div class="col-md-9" id="profile-edit-photo${i}-status" style="padding-top: 7px"><input type="file" class="form-control-file" name="profile-edit-photo${i}-file" id="profile-edit-photo${i}-file" data-picture-uploaded="false"></div></div><div class="form-group col-sm-5" style="margin-bottom: 0; margin-top: 6px; padding-right: 0"><label class="col-md-2 form-control-label" for="text-input" style="padding: 0; white-space: nowrap">Photo ${i} Caption</label><div class="col-md-10" style="padding: 0; max-width: 95%"><input type="text" id="profile-edit-photo${i}-caption" class="form-control" data-id="profile-edit-photo-caption" value="${data.data['Photo_'+i]}"></div></div><div class="col-sm-1" style="padding-left: 0; margin-top: 33px"  id="profile-edit-photo${i}-delete-area"><button type="button" class="btn btn-danger center-horizontal" onclick="deleteProfilePhoto(${i})" id="profile-edit-delete-photo${i}"><i class="fa fa-trash fa-lg mt-2 button-icon"></i></button></div>`);
            $('#profile-edit-photo'+i+'-file').on('change', function(){
                var file = $(this).get(0).files[0];
                profileEditPhotoUpload(file,String(i),this,false)
            });
            continue;
        }
        photoButtonArea.append(`<div class="form-group col-sm-2" style="margin-bottom: 0; margin-top: 6px; padding-left: 0" id="profile-edit-photo${i}-current-area"></div><div class="form-group col-sm-3" style="margin-bottom: 0; margin-top: 6px; padding-left: 0"><label class="col-md-3 form-control-label" for="profile-edit-photo${i}-file" style="max-width: 100%">Photo ${i}</label><div class="col-md-9" id="profile-edit-photo${i}-status" style="padding-top: 7px"><input type="file" class="form-control-file" name="profile-edit-photo${i}-file" id="profile-edit-photo${i}-file" data-picture-uploaded="false"></div></div><div class="form-group col-sm-5" style="margin-bottom: 0; margin-top: 6px; padding-right: 0"><label class="col-md-2 form-control-label" for="text-input" style="padding: 0; white-space: nowrap">Photo ${i} Caption</label><div class="col-md-10" style="padding: 0; max-width: 95%"><input type="text" id="profile-edit-photo${i}-caption" class="form-control" data-id="profile-edit-photo-caption" value="${$('#profile-edit-plant_name').val()}"></div></div><div class="col-sm-1" style="padding-left: 0; margin-top: 33px" id="profile-edit-photo${i}-delete-area"></div>`);
        $('#profile-edit-photo'+i+'-file').on('change', function(){
            var file = $(this).get(0).files[0];
            profileEditPhotoUpload(file,String(i),this,true)
        });
        break;
    }
}

function showEditPhoto(url,no) {
    $('#image-title').html('Photo '+no);
    $('#image-img-area').html(`<img src="${url+no}" style="max-width: 460px;height: auto">`);
    $('#image-modal').modal('show');
}

function profileEditPhotoUpload(file,no,fileElement,last){
    if(file.type != "image/jpeg") {
        $(fileElement).val('');
        return notify('danger','Error','All images must be in jpeg format!');
    }

    var plantName = currentEditProfile.Plant_Name;

    var formData = new FormData();
    formData.append('image', file);
    formData.append('name', plantName.split(' ').join('-').concat(no));

    var status = $('#profile-edit-photo'+no+'-status');
    status.html('<i class="fa fa-spinner fa-lg mt-2 fa-spin" style="margin-top: 0 !important;"></i>');

    $.ajax({
        url: '/upload/images/plant-profiles',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
            if(data.err) {
                notify('danger','Error','Image failed to upload');
                return status.html('<i class="fa fa-close fa-lg mt-2" style="margin-top: 0 !important;"></i>');
            }
            notify('success','Success','Image uploaded successfully');
            $('#profile-edit-photo'+no+'-current-area').html(`<label class="col-md-3 form-control-label" for="profile-edit-photo1-image" style="max-width: 100%">Photo ${no}</label><div class="col-md-9"><button type="button" class="btn btn-secondary"  id="profile-edit-photo${no}-current-button" onclick="showEditPhoto('/plant-profiles/images/${currentEditProfile.Plant_Name.split(' ').join('-')}',${no})">Current Image</button></div>`);
            if(last)    {
                var nextPhotoNo = String(Number(no)+1);
                $('#profile-edit-photo-area').append(`<div class="form-group col-sm-2" style="margin-bottom: 0; margin-top: 6px; padding-left: 0"  id="profile-edit-photo${nextPhotoNo}-current-area"></div><div class="form-group col-sm-3" style="margin-bottom: 0; margin-top: 6px; padding-left: 0"><label class="col-md-3 form-control-label" for="profile-edit-photo${nextPhotoNo}-file" style="max-width: 100%">Photo ${nextPhotoNo}</label><div class="col-md-9" id="profile-edit-photo${nextPhotoNo}-status" style="padding-top: 7px"><input type="file" class="form-control-file" name="profile-edit-photo${nextPhotoNo}-file" id="profile-edit-photo${nextPhotoNo}-file" data-picture-uploaded="false"></div></div><div class="form-group col-sm-5" style="margin-bottom: 0; margin-top: 6px; padding-right: 0"><label class="col-md-2 form-control-label" for="text-input" style="padding: 0; white-space: nowrap">Photo ${nextPhotoNo} Caption</label><div class="col-md-10" style="padding: 0; max-width: 95%"><input type="text" id="profile-edit-photo${nextPhotoNo}-caption" class="form-control" data-id="profile-edit-photo-caption" value="${$('#profile-edit-plant_name').val()}"></div></div><div class="col-sm-1" style="padding-left: 0; margin-top: 33px"  id="profile-edit-photo${nextPhotoNo}-delete-area"></div>`);
                $('#profile-edit-photo'+nextPhotoNo+'-file').on('change', function(){
                    var file = $(this).get(0).files[0];
                    console.log(nextPhotoNo);
                    profileEditPhotoUpload(file,nextPhotoNo,this,!(Number(nextPhotoNo)>3))
                });
            }

            return status.html('<i class="fa fa-check fa-lg mt-2" style="margin-top: 0 !important;"></i>');
        }
    });
}

function deleteProfilePhoto(no){
    swal({
            title: "Are you sure?",
            text: "The photo will not be able to be recovered",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false,
            showLoaderOnConfirm: true
        },
        function(){
            $.post("/api/page-editor/plant-profiles/delete-photo",
                {name:currentEditProfile.Plant_Name,no:no},
                function(data){
                    if(data.err) return swal("Error", "There was an error deleting the photo", "error");
                    addPhotosToEditModal(data,currentEditProfile.Plant_Name);
                    return swal("Deleted!", "The photo has been deleted", "success");
                }
            ).fail(function() {
                notify('danger','Error','An error occurred while trying to contact the server');
            });
        }
    );
}

function profileEditSave()  {
    var finalPost = {
        Plant_Name: $('#profile-edit-plant_name').val(),
        Plant_Name_Current: currentEditProfile.Plant_Name,
        Plant_Description: tinyMCE.get('profile-edit-plant_description').getContent(),
        Map: $('#profile-edit-map').is(':checked')
    };

    for(let i=1; i<5; i++)  {
        let exists = ($('#profile-edit-photo'+i+'-current-button').length > 0);
        if(exists)  {
            let photoCaption = $('#profile-edit-photo'+i+'-caption').val();
            finalPost['Photo_'+i] = photoCaption;
        }
    }

    $.ajax({
        url: '/api/page-editor/plant-profiles/edit',
        data: JSON.stringify(finalPost),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        type: 'POST',
        success: function (data) {
            if(data.err) {
                setTimeout(function () {
                    notify('danger','Error','There was an error editing this plant profile');
                },250);
                return $('#modal-edit-profile').modal('toggle');
            }
            doneTypingProfileSearch();
            $('#modal-edit-profile').modal('toggle');
            setTimeout(function () {
                notify('success','Success','Plant profile edited successfully');
            },250);
        }
    });
}

function applyModalFixes()  {
    $(document).on('show.bs.modal', '.modal', function () {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function() {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
    });

    $(document).on('hidden.bs.modal', '.modal', function () {
        $('.modal:visible').length && $(document.body).addClass('modal-open');
    });
}

function notify(type,title,message){
    $.notify({
        title: title,
        message: message
    },{
        element: 'body',
        position: null,
        type: type,
        allow_dismiss: true,
        newest_on_top: true,
        placement: {
            from: "top",
            align: "center"
        },
        offset: 20,
        spacing: 10,
        z_index: 1100,
        delay: 5000,
        timer: 1000
    });
}