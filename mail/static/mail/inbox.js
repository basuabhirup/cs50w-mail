let emailsView;
let composeView;
let emailDetailsView;

document.addEventListener("DOMContentLoaded", function () {
  emailsView = document.querySelector("#emails-view");
  composeView = document.querySelector("#compose-view");
  emailDetailsView = document.querySelector("#email-details-view");

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
  emailsView.style.display = "none";
  composeView.style.display = "block";
  emailDetailsView.style.display = "none";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  emailsView.style.display = "block";
  composeView.style.display = "none";
  emailDetailsView.style.display = "none";

  fetch(`/emails/${mailbox}`).then((response) => {
    if (response.status === 200) {
      response.json().then((emails) => {
        // console.log(emails);
        if (emails.length > 0) {
          emails.forEach((mail) => {
            // console.log(mail);
            const mailBox = document.createElement("div");
            mailBox.addEventListener("click", function () {
              load_details(mail.id);
            });
            if (!mail.read) {
              mailBox.className = "mail-box unread";
            } else {
              mailBox.className = "mail-box";
            }

            const sender = document.createElement("span");
            sender.className = "sender";
            sender.textContent = mail.sender;

            const subject = document.createElement("span");
            subject.textContent = mail.subject;
            subject.className = "subject";

            const timestamp = document.createElement("span");
            timestamp.className = "timestamp";
            timestamp.textContent = mail.timestamp;

            mailBox.appendChild(sender);
            mailBox.appendChild(subject);
            mailBox.appendChild(timestamp);

            emailsView.appendChild(mailBox);
          });
        }
      });
    } else {
      response.json().then((json) => {
        alert(json.error);
        load_mailbox("inbox");
      });
    }
  });

  // Show the mailbox name
  emailsView.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
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

function load_details(email_id) {
  // Show the details of th selected email and hide other views
  emailsView.style.display = "none";
  composeView.style.display = "none";
  emailDetailsView.style.display = "block";

  fetch(`/emails/${email_id}`)
    .then((response) => response.json())
    .then((email) => {
      // Print email
      // console.log(email);

      if (!email.error) {
        emailDetailsView.innerHTML = "";

        const header = document.createElement("section");
        header.className = "mail-header";

        const from = document.createElement("div");
        from.innerHTML = `<strong>From: </strong>${email.sender}`;

        const to = document.createElement("div");
        to.innerHTML = `<strong>To: </strong>${email.recipients.join(", ")}`;

        const subject = document.createElement("div");
        subject.innerHTML = `<strong>Subject: </strong>${email.subject}`;

        const timestamp = document.createElement("div");
        timestamp.innerHTML = `<strong>Timestamp: </strong>${email.timestamp}`;

        // const replyButton = document.createElement("button")
        // replyButton.className = "reply-button"
        // replyButton.textContent = "Reply"
        // replyButton.addEventListener("click", function() {
        //   console.log(email.sender)
        // })

        // const archiveButton = document.createElement("button")
        // archiveButton.className = "archive-button"
        // archiveButton.textContent = "Archive"
        // archiveButton.addEventListener("click", function() {
        //   console.log(email.sender)
        // })

        // const newline = document.createElement('br')

        header.appendChild(from);
        header.appendChild(to);
        header.appendChild(subject);
        header.appendChild(timestamp);
        // header.appendChild(newline)
        // header.appendChild(replyButton)
        // header.appendChild(newline)
        // header.appendChild(archiveButton)

        const divider = document.createElement("hr");

        const body = document.createElement("section");
        body.className = "mail-body";
        body.textContent = email.body;

        emailDetailsView.appendChild(header);
        emailDetailsView.appendChild(divider);
        emailDetailsView.appendChild(body);

        if (!email.read) {
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
          })
        }
      } else {
        alert(email.error)
        console.error(email.error)
        load_mailbox("inbox")
      }
    })
    .catch((error) => {
      console.error(error)
      load_mailbox("inbox")
    });
}
