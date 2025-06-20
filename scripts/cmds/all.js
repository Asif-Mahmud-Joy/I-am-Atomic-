<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atomic Tag All Members</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #1a2a6c, #2c3e50);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            width: 100%;
            max-width: 800px;
            background: rgba(15, 23, 42, 0.9);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        header {
            background: linear-gradient(90deg, #0f172a, #1e3a8a);
            padding: 30px;
            text-align: center;
            border-bottom: 2px solid #3b82f6;
        }
        
        h1 {
            font-size: 2.8rem;
            color: white;
            margin-bottom: 10px;
            letter-spacing: 1px;
        }
        
        h1 span {
            color: #60a5fa;
            text-shadow: 0 0 10px rgba(96, 165, 250, 0.7);
        }
        
        .subtitle {
            color: #93c5fd;
            font-size: 1.2rem;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
        }
        
        .content {
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 25px;
        }
        
        .panel {
            background: rgba(30, 41, 59, 0.7);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(59, 130, 246, 0.3);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .panel-title {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            color: #60a5fa;
            font-size: 1.4rem;
            font-weight: 600;
        }
        
        .panel-title i {
            font-size: 1.8rem;
        }
        
        .input-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #cbd5e1;
            font-weight: 500;
        }
        
        textarea {
            width: 100%;
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid #3b82f6;
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-size: 1.1rem;
            resize: vertical;
            min-height: 120px;
            transition: all 0.3s ease;
        }
        
        textarea:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
            border-color: #60a5fa;
        }
        
        .btn {
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 1.2rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .btn:hover {
            background: linear-gradient(90deg, #60a5fa, #93c5fd);
            transform: translateY(-3px);
            box-shadow: 0 7px 15px rgba(59, 130, 246, 0.4);
        }
        
        .btn:active {
            transform: translateY(1px);
        }
        
        .result {
            background: rgba(30, 41, 59, 0.7);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(59, 130, 246, 0.3);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            color: #e2e8f0;
            font-size: 1.1rem;
            line-height: 1.6;
            min-height: 200px;
            position: relative;
            overflow: hidden;
        }
        
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(59, 130, 246, 0.3);
        }
        
        .result-title {
            font-size: 1.3rem;
            color: #60a5fa;
            font-weight: 600;
        }
        
        .tag-list {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 20px;
        }
        
        .tag {
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid #3b82f6;
            border-radius: 8px;
            padding: 10px 15px;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        }
        
        .tag:hover {
            background: rgba(59, 130, 246, 0.3);
            transform: translateY(-3px);
        }
        
        .tag-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: linear-gradient(45deg, #3b82f6, #60a5fa);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        .footer {
            padding: 25px;
            text-align: center;
            color: #94a3b8;
            font-size: 0.9rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .atomic-badge {
            display: inline-block;
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            padding: 5px 15px;
            border-radius: 30px;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .atomic-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 20%);
            pointer-events: none;
            z-index: -1;
        }
        
        @media (max-width: 600px) {
            h1 {
                font-size: 2.2rem;
            }
            
            .content {
                padding: 20px;
            }
            
            .panel {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Atomic <span>Tag All</span></h1>
            <p class="subtitle">Professionally tag all members in your group chat with atomic design principles and beautiful visual elements</p>
        </header>
        
        <div class="content">
            <div class="panel">
                <div class="panel-title">
                    <i>⚛️</i>
                    <h2>Command Configuration</h2>
                </div>
                
                <div class="input-group">
                    <label for="message">Your Message (optional):</label>
                    <textarea id="message" placeholder="Type your message here...">Everyone, please check this important announcement!</textarea>
                </div>
                
                <button class="btn" id="tagBtn">
                    <i>🔔</i> Tag All Members
                </button>
            </div>
            
            <div class="result">
                <div class="result-header">
                    <div class="result-title">Tagging Results</div>
                    <div class="members-count">Members: <span id="count">0</span></div>
                </div>
                
                <div id="resultContent">
                    <p>Your tagged message will appear here after execution.</p>
                    <p>Click the "Tag All Members" button to simulate the command.</p>
                </div>
                
                <div class="tag-list" id="tagList"></div>
                <div class="atomic-pattern"></div>
            </div>
        </div>
        
        <div class="footer">
            <p>Atomic Design System • Professional UI/UX Implementation</p>
            <div class="atomic-badge">Powered by Atomic Design Principles</div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const tagBtn = document.getElementById('tagBtn');
            const resultContent = document.getElementById('resultContent');
            const tagList = document.getElementById('tagList');
            const countSpan = document.getElementById('count');
            const messageInput = document.getElementById('message');
            
            // Sample member data
            const members = [
                { name: "John Doe", id: "user1" },
                { name: "Jane Smith", id: "user2" },
                { name: "Alex Johnson", id: "user3" },
                { name: "Sarah Williams", id: "user4" },
                { name: "Mike Brown", id: "user5" },
                { name: "Emily Davis", id: "user6" },
                { name: "Chris Wilson", id: "user7" },
                { name: "Jessica Taylor", id: "user8" }
            ];
            
            // Update member count
            countSpan.textContent = members.length;
            
            tagBtn.addEventListener('click', function() {
                // Show processing state
                resultContent.innerHTML = `<p style="color:#93c5fd; display:flex; align-items:center; gap:10px;">
                    <span>⚛️</span> Processing your request with atomic precision...
                </p>`;
                tagList.innerHTML = '';
                
                // Simulate processing delay
                setTimeout(() => {
                    const message = messageInput.value || "Everyone, please check this important announcement!";
                    
                    // Create the tagged message
                    let taggedMessage = `╔══════════════════════════════╗
║   ⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗔𝗚 𝗔𝗟𝗟  ⚛️   ║
╚══════════════════════════════╝

${message}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃   🔷 𝗧𝗔𝗚𝗚𝗘𝗗 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 🔷   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`;
                    
                    // Create visual representation of tags
                    resultContent.innerHTML = `<div style="white-space: pre-wrap; font-family: monospace; color: #e2e8f0; line-height: 1.8;">${taggedMessage}</div>`;
                    
                    // Create member tags
                    tagList.innerHTML = '';
                    members.forEach((member, index) => {
                        const tagElement = document.createElement('div');
                        tagElement.className = 'tag';
                        tagElement.innerHTML = `
                            <div class="tag-avatar">${member.name.charAt(0)}</div>
                            <div>${member.name}</div>
                        `;
                        tagList.appendChild(tagElement);
                    });
                    
                    // Add footer to the result
                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const footer = document.createElement('div');
                    footer.style.marginTop = '20px';
                    footer.style.color = '#93c5fd';
                    footer.style.display = 'flex';
                    footer.style.justifyContent = 'space-between';
                    footer.innerHTML = `
                        <div>⚡ Total members: ${members.length}</div>
                        <div>⏳ ${time}</div>
                    `;
                    resultContent.appendChild(footer);
                    
                }, 1500);
            });
            
            // Initialize with some tags
            setTimeout(() => {
                tagBtn.click();
            }, 1000);
        });
    </script>
</body>
</html>
