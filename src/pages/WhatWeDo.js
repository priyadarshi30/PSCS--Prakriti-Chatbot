import React from 'react';
import './WhatWeDo.css';

const WhatWeDo = () => {
  const doshas = [
    {
      title: "Vata",
      icon: "🌬️",
      description: "Vata is associated with the elements of air and space. It is characterized by qualities of being dry, light, cold, rough, subtle, mobile, and clear. Vata is responsible for essential bodily functions such as breathing, circulation, and communication between cells. When in balance, Vata individuals are creative, energetic, and enthusiastic. However, an excess of Vata can lead to issues like anxiety, insomnia, and digestive problems."
    },
    {
      title: "Pitta",
      icon: "🔥",
      description: "Pitta embodies the elements of fire and water. It exhibits qualities of being hot, sharp, oily, light, and spreading. Pitta governs metabolic and transformative processes in the body, including digestion, absorption, and temperature regulation. Balanced Pitta types are intelligent, courageous, and focused. Excessive Pitta can manifest as irritability, inflammation, or digestive disorders."
    },
    {
      title: "Kapha",
      icon: "💧",
      description: "Kapha is primarily composed of earth and water elements, giving it qualities of heaviness, cold, oily, smooth, and static. Kapha oversees stability, growth, and lubrication within the body. Individuals with balanced Kapha are calm, strong, and compassionate. However, an excess of Kapha can lead to weight gain, lethargy, and respiratory problems."
    }
  ];

  return (
    <section className="what-we-do">
      <h2>Understanding Doshas</h2>
      <div className="doshas-container">
        {doshas.map((dosha, index) => (
          <div className="dosha-card" key={index}>
            <div className="dosha-icon">{dosha.icon}</div>
            <h3>{dosha.title}</h3>
            <p>{dosha.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhatWeDo;
