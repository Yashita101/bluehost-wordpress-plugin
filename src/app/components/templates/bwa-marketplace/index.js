/**
 * WordPress dependencies
 */
import { useEffect, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { BWABaseTemplate } from '@/components/templates';

import {
	BWAProductGrid,
	BWANoResults,
	BWAProductCardPlaceholder,
	BWASearch,
} from '@/components/molecules';

import {
	BWAHeading,
	BWAPagination,
	BWADropdown,
} from '@/components/atoms';

import {
	useFavorites,
	useMojoFilter,
	useMojoSearch,
	useMojoSort,
	usePaginator,
} from '@/hooks';

import { ReactComponent as NoFavorites } from '@/assets/favorite.svg';

import './style.scss';

const marketplacePageTitle = ( type ) => {
	switch ( type ) {
		case 'plugins':
			return __( 'Premium Plugins', 'bluehost-wordpress-plugin' );
		case 'services':
			return __( 'Premium Services', 'bluehost-wordpress-plugin' );
		default: // Themes
			return __( 'Premium Themes', 'bluehost-wordpress-plugin' );
	}
};

const sortByOptions = [
	{
		label: __( 'Popular', 'bluehost-wordpress-plugin' ),
		value: 'sort-sales-desc',
	},
	{
		label: __( 'Price (High to Low)', 'bluehost-wordpress-plugin' ),
		value: 'sort-price-desc',
	},
	{
		label: __( 'Price (Low to High)', 'bluehost-wordpress-plugin' ),
		value: 'sort-price-asc',
	},
	{
		label: __( 'Date Added', 'bluehost-wordpress-plugin' ),
		value: 'sort-date-desc',
	},
	// {
	// 	label: __( 'Favorites', 'bluehost-wordpress-plugin' ),
	// 	value: 'filter-favorites',
	// },
];

const BWAMarketplaceTemplate = ( { className = 'bluehost-marketplace', isLoading, payload, render, type = 'themes' } ) => {
	const [ { favorites }, { hasFavorite, toggleFavorite } ] = useFavorites();
	const [ filterBy ] = useMojoFilter( favorites );
	const [ { items, itemsPerPage, pageCount, pageNumber }, { setCollection, setPageNumber } ] = usePaginator();
	const [ sort, setSort ] = useState( 'sort-sales-desc' );
	const [ sortBy ] = useMojoSort();
	const [ { query }, { search, setQuery } ] = useMojoSearch();

	useEffect( () => {
		// Fetch items
		let results = payload.items || [];

		// Determine sort/filter method
		const [ type, method, order ] = sort.split( '-' );

		// Sort/filter
		results = ( 'filter' === type ) ? filterBy( sortBy( results, 'sales' ), method ) : sortBy( results, method, order );

		// Handle search
		results = search( results, query );

		// Split results up into pages
		setCollection( results );
		setPageNumber( 1 );
	}, [ payload, sort, query ] );

	useEffect( () => {
		// Scroll to top of page when changing pages
		window.scrollTo( 0, 0 );
	}, [ pageNumber ] );

	return (
		<BWABaseTemplate className={ className }>
			<section className={ `${ className }__header` }>
				<div className={ `${ className }__header-primary` }>
					<BWAHeading level="h2" size={ 1 } className="marketplace-page-title">{ marketplacePageTitle( type ) }</BWAHeading>
					<div className={ `${ className }__BWAPagination-container` }>
						<BWAPagination callback={ setPageNumber } currentPage={ pageNumber } pageCount={ pageCount } />
					</div>
				</div>
				<div className={ `${ className }__header-secondary` }>
					<BWASearch value={ query } onChange={ setQuery } />
					<BWADropdown
						id="sort-filter"
						label={ __( 'Sort By', 'bluehost-wordpress-plugin' ) }
						onChange={ ( value ) => setSort( value ) }
						options={ sortByOptions }
						value={ sort }
						width={ 178 }
					/>
				</div>
			</section>
			<div className={ `${ className }__content` }>
				{ ( () => {
					if ( isLoading ) {
						return (
							<BWAProductGrid>
								{ [ ...Array( itemsPerPage ).keys() ].map( ( i ) => <BWAProductCardPlaceholder key={ i } /> ) }
							</BWAProductGrid>
						);
					}

					if ( ! items || ! items.length ) {
						// Filtering by favorites, but with no results
						if ( sort === 'filter-favorites' ) {
							return (
								<div className="bluehost-no-results">
									<NoFavorites />
									<h2>{ __( 'You don\'t have any favorites yet.', 'bluehost-wordpress-plugin' ) }</h2>
									<p>{ __( 'Add favorites by starring items you like.', 'bluehost-wordpress-plugin' ) }</p>
									<a href="#" onClick={ ( e ) => {
										e.preventDefault();
										setSort( 'sort-sales-desc' );
									} }>
										{ ( () => {
											switch ( type ) {
												case 'plugins':
													return __( 'View Plugins', 'bluehost-wordpress-plugin' );
												case 'services':
													return __( 'View Services', 'bluehost-wordpress-plugin' );
												default: // Themes
													return __( 'View Themes', 'bluehost-wordpress-plugin' );
											}
										} )() }
									</a>
								</div>
							);
						}

						return (
							<BWANoResults />
						);
					}

					return (
						<BWAProductGrid>
							{ items.map( ( item ) => render( { item, hasFavorite, toggleFavorite } ) ) }
						</BWAProductGrid>
					);
				} )() }
			</div>
			<footer className={ `${ className }__footer` }>
				<div className={ `${ className }__ad` }>
					{ /* <img alt="" /> */ }
				</div>
				<BWAPagination callback={ setPageNumber } currentPage={ pageNumber } pageCount={ pageCount } />
			</footer>
		</BWABaseTemplate>
	);
};

export default BWAMarketplaceTemplate;