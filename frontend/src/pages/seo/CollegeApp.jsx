import React from 'react';
import SEOLanding from './SEOLanding';

const CollegeApp = () => {
    const data = {
        title: "College Networking App",
        description: "The next-generation college networking app designed for high-performance students. Decrypt your campus potential with KULT.",
        keywords: "college networking app, campus networking platform, student event app, college community app",
        slug: "college-networking-app",
        content: [
            {
                heading: "Rewiring Campus Connectivity",
                text: [
                    "Most college networking apps are distractions. KULT is a tool for professional and technical expansion. We have rewired campus connectivity to focus on what actually matters: missions, hubs, and intelligence. Our app allows students to find their tribe, build their reputation, and access missions that actually move the needle.",
                    "The KULT mobile-optimized experience ensures that you are always connected to your hub, no matter where your mission takes you. It’s the terminal you need to navigate your college years with maximum impact."
                ]
            },
            {
                heading: "High-Octane Hubs",
                text: [
                    "Our app is built around the concept of 'Hubs'—specialized student groups focused on specific technical or creative domains. Whether you are into low-level engineering, decentralized finance, or creative arts, there is a KULT hub for you. And if there isn't, you can build it.",
                    "With real-time notifications, unified event schedules, and encrypted intelligence sharing, the KULT college networking app is the command center for your academic and professional life."
                ]
            },
            {
                heading: "Beyond the Campus Gates",
                text: [
                    "Networking should not stop at your university walls. KULT bridges the gap between different campuses, creating a massive, interconnected network of talent. The app facilitates inter-college missions and joint hub events, allowing you to build a network that truly scales.",
                    "Download the protocol. Join the network. Scale your intelligence. The KULT app is free to use and designed for those who refuse to be average."
                ]
            }
        ]
    };

    return <SEOLanding {...data} />;
};

export default CollegeApp;
