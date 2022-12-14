import {tratarErros} from "./erroRequest";
import "../../css/carregadores/carregando.css";

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
        this._searching = false;
        this._data_src = "data";
        this._defineLoader = `<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>`;
    }

    defineLoader(loader) {
        this._defineLoader = loader;
    }

    podePesquisar(pode) {
        this._searching = pode;
    }

    defineDataSrc (_data_src) {
        this._data_src = data_src;
    }

    defineOrdenacao(posicao, direcao = "desc") {
        this._ordem = [[ posicao, direcao ]];
    }

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

    modificaColunas(row, data) {}

    loadCompleto(settings, json, tabela) {}

    xhrCompleto(retorno, tabela) {
        let self = this;
        $(self._divPai).removeClass('hidden');
        $(self._divPai).show();
        $(self._idTabela).css("width", "100%");
        $('html, body').animate({ scrollTop: $(self._divPai).offset().top }, 'slow');
        tabela.columns.adjust();
    }

    async efetuarConsulta() {
        let self = this;

        $.fn.dataTable.ext.errMode = 'throw';

        if ($.fn.dataTable.isDataTable(self._idTabela) ) {
            $(self._idTabela).DataTable().clear().destroy();
            if (document.getElementById('cabecalho-fixador') !== null) {
                document.getElementById('cabecalho-fixador').remove();
            }
        }

        $(self._idTabela).empty();

        let tabela = $(self._idTabela).DataTable({
            "processing": true,
            "searching": this._searching,
            "destroy": true,
            "deferRender": true,
            "sScrollX": true,
            "pageLength": 20,
            "lengthMenu": [[20, 40, 60, 80, 100], [20, 40, 60, 80, 100]],
            "serverSide": self.serverSide,
            "initComplete": function( settings, json ) {
                self.loadCompleto(settings, json, tabela);
            },
            "ajax": {
                url : self._url,
                type: "POST",
                dataSrc: self._data_src,
                data: function (d,settings) {
                    self.filtroDatatable(d, settings);
                },
                beforeSend: this._beforeSend,
                error: function (jqXHR, textStatus, errorThrown) {
                    self.datatableError(jqXHR, textStatus, errorThrown);
                },
                complete: function(retorno) {
                    if(parseInt(retorno.status) === 200)
                    {
                        self.xhrCompleto(retorno, tabela);
                    }
                    else
                    {
                        $(self._idTabela).DataTable().clear().destroy();
                        $(self._divPai).addClass('hidden');
                        if (document.getElementById('cabecalho-fixador') !== null) {
                            document.getElementById('cabecalho-fixador').remove();
                        }
                    }
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
            },
            rowCallback: function (row, data) {
                self.modificaColunas(row, data);
            }
        });

        return tabela;
    }
}

export {HelperDatatables};
