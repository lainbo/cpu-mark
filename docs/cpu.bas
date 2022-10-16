Attribute VB_Name = "模块1"
Sub cpu_handle()
Attribute cpu_handle.VB_Description = "cpu等数据处理的宏"
Attribute cpu_handle.VB_ProcData.VB_Invoke_Func = "n\n14"
'
' cpu_handle 宏
' cpu等数据处理的宏
'
' 快捷键: Ctrl+n
'
    Range("A1").Select
    ActiveCell.FormulaR1C1 = "nameDetail"
    Range("B1").Select
    ActiveCell.FormulaR1C1 = "mark"
    Cells.Replace What:=""",", Replacement:="", LookAt:=xlPart, SearchOrder _
        :=xlByRows, MatchCase:=False, SearchFormat:=False, ReplaceFormat:=False _
        , FormulaVersion:=xlReplaceFormula2
    Cells.Replace What:="""", Replacement:="", LookAt:=xlPart, SearchOrder _
        :=xlByRows, MatchCase:=False, SearchFormat:=False, ReplaceFormat:=False _
        , FormulaVersion:=xlReplaceFormula2
    Columns("A:A").Select
    ActiveSheet.Range("$A$1:$B$1452").RemoveDuplicates Columns:=1, Header:= _
        xlYes
End Sub
