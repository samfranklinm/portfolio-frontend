// Contact.js
import React from 'react';

function Contact() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-4">Contact Me</h2>
      <form className="flex flex-col space-y-4">
        <input className="p-2 border" type="text" placeholder="Name" />
        <input className="p-2 border" type="email" placeholder="Email" />
        <textarea className="p-2 border" placeholder="Message" rows="5"></textarea>
        <button className="p-2 bg-black text-[#8e8b88] hover:bg-[#8e8b88]-800">Send</button>
      </form>
    </div>
  );
}

export default Contact;