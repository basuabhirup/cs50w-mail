document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  const emailsView = document.querySelector("#emails-view")

  fetch(`/emails/${mailbox}`).then((response) => {
    if (response.status === 200) {
      response.json().then((emails) => {
        console.log(emails);
        if (emails.length > 0) {
          emails.forEach((mail) => {
            console.log(mail)
            const mailBox = document.createElement('div')
            mailBox.className = 'mail-box'

            const sender = document.createElement('span')
            sender.className = 'sender'
            sender.textContent = mail.sender

            const subject = document.createElement('span')
            subject.textContent = mail.subject
            subject.className = 'subject'

            const timestamp = document.createElement('span')
            timestamp.className = 'timestamp'
            timestamp.textContent = mail.timestamp

            mailBox.appendChild(sender)
            mailBox.appendChild(subject)
            mailBox.appendChild(timestamp)

            emailsView.appendChild(mailBox)          
            
          });
        }
      });
    } else {
      response.json().then((json) => {
        alert(json.error);
        load_mailbox("inbox")
      });
    }
  });

  // Show the mailbox name
  emailsView.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  console.log(mails)
}

function onEmailSent(event) {
  event.preventDefault();
  const recipients = document.getElementById("compose-recipients");
  const subject = document.getElementById("compose-subject");
  const body = document.getElementById("compose-body");

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients.value,
      subject: subject.value,
      body: body.value,
    }),
  })
    .then((response) => {
      // console.log(response)
      if (response.status === 201) {
        response.json().then((result) => {
          // console.log(result)
          load_mailbox("sent");
          recipients.value = "";
          subject.value = "";
          body.value = "";
          alert(result.message);
        });
      } else {
        response.json().then((result) => {
          // console.log(result)
          alert(result.error);
        });
      }
    })
    .catch((error) => console.error(error));
}
