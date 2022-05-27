class HelperDatatables {

    constructor(idTabela, url, divPai, parametros_consulta = {}, serverSide  = true, beforeSend = function () {}) {
        this._idTabela = idTabela;
        this._parametros_consulta = parametros_consulta;
        this._beforeSend = beforeSend;
        this._url = url;
        this.serverSide = serverSide;
        this._cabecalho = [];
        this._configuracao_colunas = [];
        this._ordem = [[ 0, "asc" ]];
        this._ordena = false;
        this._divPai = divPai;
    }

    defineOrdenacao(ordem) { this._ordem = ordem; }

    recuperaOrdem() { return this._ordem; }

    podeOrdenar(ordena) { this._ordena = ordena;}

    defineCabecalho(_cabecalho = []) { this._cabecalho = _cabecalho;}

    recuperaCabecalho() { return this._cabecalho;}

    defineConfiguracaoColunas(configuracao_colunas) { this._configuracao_colunas = configuracao_colunas; }

    recuperaConfiguracaoColunas() { return this._configuracao_colunas;}

    datatableError(jqXHR, textStatus, errorThrown) {
        if(parseInt(jqXHR.status) === 403) {
            tratarErros(jqXHR, "Será necessário efetuar o login novamente.");
            location.reload();
            return;
        }
        tratarErros(jqXHR, "Ocorreu um erro na consulta");
    }

    filtroDatatable (d, settings) {
        var api = new $.fn.dataTable.Api(settings);

        d.pagina = Math.min(
            Math.max(0, Math.round(d.start / api.page.len())),
            api.page.info().pages
        );

        for(let item in this._parametros_consulta) {
            d[item] = this._parametros_consulta[item];
        }
    }

    criarLinhas(row, data, dataIndex ) {}

    async efetuarConsulta() {
        let self = this;

        if ($.fn.DataTable.isDataTable(self._idTabela)) {
            $(self._idTabela).DataTable().clear().destroy();
        }

        $(self._idTabela).empty();

        let tabela = $(self._idTabela).DataTable({
            "processing": true,
            "searching": false,
            "destroy": true,
            "sScrollX": true,
            "pageLength": 20,
            "lengthMenu": [[20, 40, 60, 80, 100], [20, 40, 60, 80, 100]],
            "serverSide": self.serverSide,
            "ajax": {
                url : self._url,
                type: "POST",
                data: function (d,settings) {
                    self.filtroDatatable(d, settings);
                },
                beforeSend: this._beforeSend,
                error: function (jqXHR, textStatus, errorThrown) {
                    fecharLoader();
                    self.datatableError(jqXHR, textStatus, errorThrown);
                },
                complete: function(retorno) {
                    $(self._divPai).removeClass('hidden');
                    $(self._divPai).show();
                    $(self._idTabela).css("width", "100%");
                    $('html, body').animate({ scrollTop: $(self._divPai).offset().top }, 'slow');
                    tabela.columns.adjust();
                    fecharLoader();
                }
            },
            language: {
                processing: '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>',
                lengthMenu: "Mostrar _MENU_ registros por página",
                zeroRecords: "Nenhum registro encontrado",
                info: "Mostrando _START_ / _END_ de _TOTAL_ registro(s)",
                infoEmpty: "Mostrando 0 / 0 de 0 registros",
                infoFiltered: "(filtrado de _MAX_ registros)",
                search: "Pesquisar: ",
                paginate: {
                    first: "Início",
                    previous: "Anterior",
                    next: "Próximo",
                    last: "Último"
                }
            },
            ordering: self._ordena,
            order: self.recuperaOrdem(),
            columns: self.recuperaCabecalho(),
            columnDefs: self.recuperaConfiguracaoColunas(),
            createdRow: function( row, data, dataIndex ) {
                self.criarLinhas(row, data, dataIndex);
            }
        });

        return tabela;
    }
}

export {HelperDatatables};
