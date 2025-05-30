import { os }  from 'os';

export default class Utilities {

    static getIPAddress(): string {
        let IP = "";
        fetch("https://ipinfo.io/json") 
                .then(response => response.json())
                .then(data => {
					IP = data.ip;
                })
				.catch(error => {
					console.error("Error fetching IP address:", error);
                    IP = "Error fetching IP address";
                });
          return IP;  
    }
}