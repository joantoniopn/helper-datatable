# helper-datatable
Gerador de tabelas usando o DataTables

<p><a href="[/url](https://datatables.net/reference/option/columnDefs)" title="columnDefs">DataTables columnDefs</a></p>
<p><a href="[/url](https://datatables.net/reference/option/columns)" title="columnDefs">DataTables columns</a></p>

```
// parametros que serão enviados 
let objeto_consulta = {};

// Exemplo informando as colunas
let cabecalho_padrao_datatables = [
  { title: 'Coluna 1', data: 'coluna_1', className: 'text-capitalize'},
  { title: `Coluna 2`, data: 'coluna_2', className: 'text-center'},
];

// Exemplo para formatar nos padrões do ColumnDefs
let coluna_definicao_datatables = [
    {
        render: function (data, type, full, meta) {
            if (type === "sort" || type === 'type') {
                return data;
            } else {
                return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(data);
            }
        },
        targets: [1]
    },
];

let geradorTabela = new GeradorTabela('#id-table', 'https://url-consulta', '#div-table', objeto_consulta);
geradorTabela.defineCabecalho(cabecalho_padrao_datatables);
geradorTabela.defineConfiguracaoColunas(configuracaoColunas);
geradorTabela.podeOrdenar(true);
geradorTabela.efetuarConsulta();

```
