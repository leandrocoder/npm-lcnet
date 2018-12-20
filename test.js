function getLocalIP(allInterfaces = false)
		{
			 let ip = [];

			// node
			if (typeof window === 'undefined')
			{
				let os = require('os');
				let ifaces = os.networkInterfaces();
				
				Object.keys(ifaces).forEach(function (ifname) {
					let alias = 0;
					ifaces[ifname].forEach(function (iface) {
						if ('IPv4' !== iface.family || iface.internal !== false) {
							// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
							return;
						}
						
						ip.push(iface.address);
					});
				});
			}
			// browser
			else 
			{
				window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || false;

				if (window.RTCPeerConnection)
				{
					var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};
					pc.createDataChannel('');
					pc.createOffer(pc.setLocalDescription.bind(pc), noop);

					pc.onicecandidate = function(event)
					{
						if (event && event.candidate && event.candidate.candidate)
						{
							var s = event.candidate.candidate.split('\n');
							ip.push(s[0].split(' ')[4]);
						}
					}
				}
            }
            
            console.log('allInterfaces', allInterfaces);
            let localhost = '127.0.0.1';
            
            if (allInterfaces == true)
            {
                return (ip.length == 0 ? [localhost] : ip); 
            }
            else
            {
                return (ip.length > 0 ? ip[0] :localhost);
            }
			
		}

console.log (getLocalIP());
