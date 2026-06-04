Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
backendDir = scriptDir & "\backend"

shell.CurrentDirectory = backendDir
shell.Environment("PROCESS")("SERVE_FRONTEND") = "true"
shell.Run "node.exe server.js", 0, False
