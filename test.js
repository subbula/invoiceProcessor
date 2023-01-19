// var nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     host: 'smtp.office365.com',
//     port: 587,
//     auth: {
//         user: '[subbulakshmi.r@ibm.com]',
//         pass: '[KuttyVihanna@123]'
//     }
// });

// // send email
// const sendMsg = async() => {
//   await transporter.sendMail({
//     from: 'subbulakshmi.r@ibm.com',
//     to: 'subbulakshmi.r@ibm.com',
//     subject: 'Test Email Subject',
//     html: '<h1>Example HTML Message Body</h1>'
// });
// }

// sendMsg();


function filterNumbersFromArray(arr) {
      // Write the code that goes here
      arr.forEach((one) => { return isNaN (one) })
}

var arr = [1, 'a', 'b', 2];
filterNumbersFromArray(arr);
console.log(arr);