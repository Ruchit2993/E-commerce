document.addEventListener('DOMContentLoaded', function () {
  //Fetch header
  fetch('../components/headerNew.html')
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch headerNew.html: ${response.statusText}`);
      return response.text();
    })
    .then(data => {
      document.getElementById('headerNew-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error fetching header:', error.message));

  //Fetch footer
  fetch('../components/footer.html')
    .then(response => {
      if (!response.ok) throw new Error(`Failed to fetch footer.html: ${response.statusText}`);
      return response.text();
    })
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error fetching footer:', error.message));

  //Form validation
  const form = document.getElementById('profile-form');
  const inputs = form.querySelectorAll('input[required], select[required]');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const genderGroup = form.querySelectorAll('input[name="gender"]');
  const interestGroup = form.querySelectorAll('input[name="interest"]');

  function validateForm() {
    let isValid = true;

    //Check required inputs and selects
    inputs.forEach(input => {
      if (!input.value.trim()) {
        input.classList.add('is-invalid');
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    });

    //Validate gender
    if (!form.querySelector('input[name="gender"]:checked')) {
      genderGroup.forEach(input => input.classList.add('is-invalid'));
      isValid = false;
    } else {
      genderGroup.forEach(input => input.classList.remove('is-invalid'));
    }

    //Validate interest
    if (!form.querySelector('input[name="interest"]:checked')) {
      interestGroup.forEach(input => input.classList.add('is-invalid'));
      isValid = false;
    } else {
      interestGroup.forEach(input => input.classList.remove('is-invalid'));
    }

    //Check mobile number
    const mobileNumber = document.getElementById('mobile-number').value;
    if (mobileNumber && mobileNumber.length < 10) {
      document.getElementById('mobile-number').classList.add('is-invalid');
      isValid = false;
    } else {
      document.getElementById('mobile-number').classList.remove('is-invalid');
    }

    //Check password match
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      document.getElementById('new-password').classList.add('is-invalid');
      document.getElementById('confirm-password').classList.add('is-invalid');
      isValid = false;
    } else {
      document.getElementById('new-password').classList.remove('is-invalid');
      document.getElementById('confirm-password').classList.remove('is-invalid');
    }

    return isValid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (validateForm()) {
      const updatedProfile = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        email: document.getElementById('email').value,
        address: { address: document.getElementById('address').value },
        gender: form.querySelector('input[name="gender"]:checked')?.value || '',
        interest: Array.from(form.querySelectorAll('input[name="interest"]:checked')).map(cb => cb.value),
        country: document.getElementById('country').value,
        state: document.getElementById('state').value,
        city: document.getElementById('city').value,
        mobileNumber: document.getElementById('mobile-number').value
      };
      alert('Profile updated successfully!');
      window.location.href = '../components/account.html';
    }
  });

  cancelBtn.addEventListener('click', function () {
    window.location.href = '../components/test-2.html';
  });

  //validation on input change
  inputs.forEach(input => {
    input.addEventListener('input', function () {
      if (input.value.trim()) {
        input.classList.remove('is-invalid');
      }
    });
  });

  //validation for gender
  genderGroup.forEach(input => {
    input.addEventListener('change', function () {
      if (form.querySelector('input[name="gender"]:checked')) {
        genderGroup.forEach(input => input.classList.remove('is-invalid'));
      }
    });
  });

  //validation for interest
  interestGroup.forEach(input => {
    input.addEventListener('change', function () {
      if (form.querySelector('input[name="interest"]:checked')) {
        interestGroup.forEach(input => input.classList.remove('is-invalid'));
      }
    });
  });
});