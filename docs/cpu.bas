Attribute VB_Name = "ģ��1"
Sub cpu_handle()
Attribute cpu_handle.VB_Description = "cpu�����ݴ���ĺ�"
Attribute cpu_handle.VB_ProcData.VB_Invoke_Func = "n\n14"
'
' cpu_handle ��
' cpu�����ݴ���ĺ�
'
' ��ݼ�: Ctrl+n
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
