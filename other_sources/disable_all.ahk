OnExit, ExitSub
Regwrite, REG_SZ, HKEY_LOCAL_MACHINE,SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\taskmgr.exe, Debugger, Hotkey Disabled
WinHide,ahk_class Shell_TrayWnd
WinHide,Start ahk_class Button
^!Del::
LWin:: 
RWin:: 
#Escape::
^Escape::
^+Escape::
!Escape::
#+Escape::
AppsKey::
#TAB:: 
#+TAB:: 
!Tab:: 
^!Tab::
!+TAB::
#PAUSE::
F11::
#F1::
#+m::
^q::
^w::
^F4::
!F4::
!Space::
	return ; i.e. do nothing
F12::
	FileReadLine, Username, C:\bf\temp\pwd.txt, 1
	if not ErrorLevel  ; Successfully loaded.
	{
  		FileReadLine, Password, C:\bf\temp\pwd.txt, 2
  		if not ErrorLevel  ; Successfully loaded.
  		{
    			FileDelete, C:\bf\temp\pwd.txt
    			if ((Username="user") and (Password="pass"))
			{
      				RegDelete,HKEY_LOCAL_MACHINE,SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\taskmgr.exe
    				WinShow,ahk_class Shell_TrayWnd
      				WinShow,Start ahk_class Button
      				ExitApp
    			} else 
    			{
      				Password =  ; Free the memory.
      				return
    			}
 		}
	} else 
	{
		return
	}

ExitSub:
  RegDelete,HKEY_LOCAL_MACHINE,SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\taskmgr.exe
  WinShow,ahk_class Shell_TrayWnd
  WinShow,Start ahk_class Button
  ExitApp
  return