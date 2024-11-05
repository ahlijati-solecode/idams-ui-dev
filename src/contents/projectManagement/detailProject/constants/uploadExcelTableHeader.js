const columns = [
  {
    Header: 'Reviewer',
    accessor: 'reviewerName',
    editable: false,
    disableSort: true,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Fungsi / Jabatan',
    accessor: 'positionFunction',
    editable: false,
    disableSort: true,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Aspek',
    accessor: 'followUpAspectParId',
    editable: false,
    disableSort: true,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Hasil Review',
    accessor: 'reviewResult',
    editable: false,
    disableSort: true,
    headerStyle: {
      maxWidth: '100%',
      minWidth: '100%',
      width: '100%',
    },
  },
  {
    Header: 'Deskripsi Resiko',
    accessor: 'riskDescription',
    editable: false,
    disableSort: true,
    headerStyle: {
      maxWidth: '6%',
      minWidth: '6%',
      width: '6%',
    },
  },
  {
    Header: 'Saran / Rekomendasi',
    accessor: 'recommendation',
    editable: false,
    disableSort: true,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Tingkat Resiko',
    accessor: 'riskLevelParId',
    editable: false,
    disableSort: true,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
  {
    Header: 'Ket. / Justifikasi',
    accessor: 'notes',
    editable: false,
    disableSort: true,
    headerStyle: {
      maxWidth: '13%',
      minWidth: '13%',
      width: '13%',
    },
  },
];

export default columns;
