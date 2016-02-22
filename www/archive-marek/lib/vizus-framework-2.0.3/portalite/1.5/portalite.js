$(document).ready(function(){
	if ($('#Label'))
	{
		$('#Label').blur(function(){
			if(document.getElementById('Title') && !document.getElementById('Title').value.length)
			{
				document.getElementById('Title').value = document.getElementById('Label').value;
			}
		});
	}
	
	if ($('#MainPage'))
	{
		$('#MainPage').change(function(){
			var num = 0;
			var mainPageId = parseInt($('#MainPage option:selected').val());
	
			FormMultiSelectGroup('page-ids', []);
	
			$('#FormMultiSelectpage-ids option').each(function(){
				if(!$(this).attr('selected') && $(this).val() == mainPageId)
				{
					$(this).attr('selected', 'selected');
	
					$('#FormMultiSelectItemNamepage-ids-'+num).removeClass('inactive');
					$('#FormMultiSelectItemStatuspage-ids-'+num).removeClass('inactive');
	
					$('#FormMultiSelectItemNamepage-ids-'+num).addClass('active');
					$('#FormMultiSelectItemStatuspage-ids-'+num).addClass('active');
				}
	
				num++;		
			});
		});
	}

	if ($('#PerPage'))
	{
		if($('#PerPage').val() == 0 || $('#PerPage').val() == "")
		{
			$('#PerPage').val(10);
		}
	}
});