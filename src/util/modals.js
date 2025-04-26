export const userEditModal = {
    open: function(user) {
        let modal = document.getElementById('user-edit-modal');

        modal.querySelectorAll('[name=user-id]').forEach(
            el => el.value = user.id
        );
        modal.querySelector('#edit-username').value = user.name;
        modal.querySelector('#edit-organizator').checked = user.organizator;
        modal.querySelector('#edit-administrator').checked = user.administrator;
        modal.showModal();
    },
    close: function() {
        document.getElementById('user-edit-modal').close();
    }
}

export const userDeleteModal = {
    open: function(user) {
        let modal = document.getElementById('user-delete-modal');

        modal.querySelectorAll('[name=user-id]').forEach(
            el => el.value = user.id
        );
        modal.querySelector('#delete-username').innerText = user.name;
        modal.showModal();
    },
    close: function() {
        document.getElementById('user-delete-modal').close();
    }
}

export const groupDeleteModal = {
    open: function(group) {
        let modal = document.getElementById('group-delete-modal');

        modal.querySelectorAll('[name=group-id]').forEach(
            el => el.value = group.id
        );
        modal.querySelector('#delete-group-name').innerText = group.name;
        modal.showModal();
    },
    close: function() {
        document.getElementById('group-delete-modal').close();
    }
}

export const pollDeleteModal = {
    open: function(poll) {
        let modal = document.getElementById('poll-delete-modal');

        modal.querySelectorAll('[name=poll-id]').forEach(
            el => el.value = poll.id
        );
        modal.querySelector('#delete-poll-name').innerText = poll.name;
        modal.showModal();
    },
    close: function() {
        document.getElementById('poll-delete-modal').close();
    }
}