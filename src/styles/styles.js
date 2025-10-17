
// This file contains stylesheet requirements for our TheOffensiveBard app.

// MIT License

// Copyright (c) 2023 David Young

// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
// documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
// Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
// WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
    drawerContent: {
        activeTintColor: '#e91e63',
        itemStyle: { marginVertical: 10 },
    },
    navigationHeaderText: {
        color: 'black',
        fontFamily: 'Inter-Black',
        fontSize: 15,
    },
    headerTextView: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignSelf: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    headerSubtitle: {
        fontSize: 12,
        fontStyle: 'italic',
        color: 'cadetblue',
    },
    appTopView: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: 4,
        alignItems: 'stretch',
    },
    appBar: {
        backgroundColor: 'cadetblue',
        borderRadius: 10,
    },
    appBarSubtitle: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    insultPageView: {
        flex: 1,
        flexDirection: 'column',
        marginTop: 8,
        height: '100%',
        width: '100%',
        justifyContent: 'flex-start',
    },
    insultTopView: {
        flex: 1,
        width: '100%',
        marginTop: -40,
    },
    backgroundImage: {
        flex: 1,
    },
    insultListContainer: {
        flex: 1,
        paddingBottom: 50,
    },
    insultHeader: {
        fontFamily: 'Inter-Black',
        fontSize: 25,
        paddingBottom: 10,
    },
    insultItemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8dcc8',
        borderRadius: 8,
        marginVertical: 2,
        marginHorizontal: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    insultText: {
        fontFamily: 'IMFellEnglish',
        fontSize: 14,
        padding: 0,
        margin: 0,
        color: 'black',
        lineHeight: 18,
    },
    insultSelectedText: {
        fontFamily: 'IMFellEnglish',
        fontSize: 14,
        padding: 0,
        margin: 0,
        color: 'maroon',
        fontWeight: 'bold',
        lineHeight: 18,
    },
    insultButtons: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        elevation: 3,
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: 'cadetblue',
        borderColor: '#fff',
        opacity: 0.8,
        minHeight: 44,
    },
    insultButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    disabledInsultButtons: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        elevation: 3,
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: 'lightgrey',
        borderColor: '#fff',
        opacity: 0.8,
        minHeight: 44,
    },
    insultFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 0,
        paddingTop: 8,
        alignItems: 'stretch',
    },
    insultSelected: {
        backgroundColor: 'cadetblue',
    },
    insultSurfaceParent: {
        flex: 1,
        justifyContent: 'flex-start',
        width: '100%',
        marginTop: 8,
        marginBottom: 8,
    },
    insultSurface: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: 16,
        padding: 0,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 4,
    },
    listHeaderView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 5,
        width: '100%',
        paddingVertical: 6,
        paddingHorizontal: 4,
        marginHorizontal: 4,
        backgroundColor: 'ghostwhite',
        opacity: 0.95,
    },
    listHeaderSeason: {
        color: 'teal',
        fontWeight: 'bold',
        fontSize: 16,
        padding: 4,
    },
    listHeaderInsult: {
        fontFamily: 'BlackChancery',
        fontSize: 16,
        padding: 4,
    },
    listHeaderTyrannis: {
        color: 'black',
        fontSize: 12,
        padding: 4,
        fontStyle: 'italic',
    },
    flatList: {
        flex: 1,
        width: '100%',
        flexDirection: 'column',
        paddingTop: 0,
        marginTop: 0,
    },
    insultList: {
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'flex-start',
    },
    favoriteInsultsSurface: {
        flex: 1,
        paddingBottom: '5%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    spacer: {
        width: 6,
    },
    webViewTop: {
        flex: 1,
        flexDirection: 'column',
    },
    webView: {
        flex: 1,
    },
    webFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    webButtons: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        elevation: 3,
        paddingVertical: 10,
        paddingHorizontal: 8,
        backgroundColor: 'cadetblue',
        borderColor: '#fff',
        opacity: 0.8,
        minHeight: 44,
    },
    webText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    favoritesTopView: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: 4,
        alignItems: 'stretch',
        marginTop: -40,
    },
    favoritesHeadingView: {
        alignItems: 'center',
        paddingBottom: 10,
    },
    favoritesHeading: {
        fontWeight: 'bold',
        color: 'teal',
        fontSize: 25,
        marginTop: 20,
    },
    favoritesSurface: {
        flex: 1,
        alignItems: 'stretch',
        borderRadius: 10,
        marginLeft: 4,
        marginRight: 4,
        marginTop: 8,
        marginBottom: 8,
    },
    favoritesListView: {
        flex: 1,
    },
    favoritesFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        paddingHorizontal: 4,
    },
    favoritesButtons: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        elevation: 3,
        paddingVertical: 10,
        paddingHorizontal: 4,
        backgroundColor: 'cadetblue',
        borderColor: '#fff',
        opacity: 0.8,
        minHeight: 44,
    },
    favoritesButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    disabledFavoritesButtons: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        elevation: 3,
        paddingVertical: 10,
        paddingHorizontal: 4,
        backgroundColor: 'lightgrey',
        borderColor: '#fff',
        opacity: 0.8,
        minHeight: 44,
    },
    noFavoritesView: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    noFavoritesText: {
        alignItems: 'center',
        fontWeight: 'bold',
        color: 'maroon',
        fontSize: 14,
        paddingBottom: 10,
    },
    floatingPressable: {
        backgroundColor: 'teal',
        position: 'absolute',
        bottom: 0,
        right: 0
    },
    touchableIconView: {
        position: 'absolute',
        right: 0,
        marginLeft: 2,
    },
    touchableIconSpacerView: {
        position: 'absolute',
        right: 0,
        marginLeft: 2,
    },
    aboutPage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    aboutPageText: {
        fontSize: 16,
        fontWeight: '700'
    },
    fjbTopView: {
        flex: 1,
        flexDirection: 'column',
        marginHorizontal: 4,
        alignItems: 'stretch',
        justifyContent: 'center',
        marginTop: 10,
    },
    codeWordsHeaderView: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 40,
    },
    codeWordsBanner: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        position: 'absolute',
        top: 0,
    },
    codeWordsHeaderText: {
        color: 'teal',
        fontWeight: 'bold',
        fontSize: 15,
        padding: 4,
        opacity: 0.5,
    },
    codeWordsSurface: {
        alignItems: 'stretch',
        height: '94%',
        borderRadius: 10,
        marginLeft: 4,
        marginRight: 4,
    },
    codeWordsView: {
        flex: 1,
        height: '100%',
        width: '100%',
    },
    codeWordsFooter: {
        bottom: 0,
        left: 0,
        right: 0,
        marginBottom: '10%',
        alignItems: 'stretch',
        position: 'absolute',
    },
    codeWordsButtons: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        elevation: 3,
        padding: 4,
        marginLeft: '4%',
        marginRight: '4%',
        backgroundColor: 'cadetblue',
        borderColor: '#fff',
        opacity: 0.8,
    },
    codeWordsButtonText: {
        color: 'white',
        fontSize: 16,
    },
    codeWordsListView: {
        width: '100%',
        height: '100%',
    },
    codeWordText: {
        fontSize: 11,
        padding: 2,
        margin: 4,
    },
    fetchErrorView: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    fetchErrorText: {
        alignItems: 'center',
        fontWeight: 'bold',
        color: 'maroon',
        fontSize: 12,
        paddingBottom: 10,
    },
    searchBarContainer: {
        overflow: 'hidden',
        backgroundColor: 'white',
        borderRadius: 10,
        marginHorizontal: 8,
        marginTop: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        padding: 0,
    },
    searchResultCount: {
        fontSize: 14,
        color: '#5f9ea0',
        fontWeight: '600',
        marginRight: 8,
    },
    searchClearButton: {
        padding: 4,
    },
    searchToggleButton: {
        padding: 4,
    },
});

export default styles;
